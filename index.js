import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import {fileURLToPath} from "url";
import path, {dirname} from "path";
import fs from "fs";
import multer from "multer";
import cors from "cors";

import Constants from "./src/constants/Constants.js";
import listPaths from "./src/main/all.js";
import {
  uploadFileToDrive,
  downloadFiles,
  addNewFolder,
  getFolderNames,
} from "./src/main/googleapi/index.js";
import isValidMimetype from "./src/constants/MimeType.js";

dotenv.config();
const app = express();
const env = process.env.NODE_ENV;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = Constants.port;
const {baseurl, categories} = Constants;

/* MIDDLEWARE */
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(cors({origin: "*"}));

/* <--- Required for Uploading files locally ---> */
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      console.log("query: ", req?.query);
      const category = req?.query?.category ? req?.query?.category : "";
      const folder = req?.query?.folder ? req?.query?.folder : "";

      // Construct full path
      const filePath = folder
        ? path.join(__dirname, "public", category, folder)
        : path.join(__dirname, "public", category);

      // Create directory if it doesn't exist
      fs.mkdirSync(filePath, {recursive: true});
      console.log("Upload destination:", filePath);

      cb(null, filePath);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (isValidMimetype(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid mime type: [${file.mimetype}]`));
    }
  },
}).single("asset");

app.use(express.json());
app.use(express.urlencoded({extended: true}));

/* Ping app to avoid going to sleep */
setInterval(async () => {
  await axios.get(Constants.baseurl);
  console.log("App Pinged");
}, 600000);

/* <--- ROUTES ---> */

/* LOGIN PAGE */
app.get("/", (req, res) => {
  res.render(`${__dirname}/src/views/index.ejs`);
});

/* Dashboard Page */
app.get("/dashboard", (req, res) => {
  req?.query?.password === process.env.ADMIN_PASSWORD
    ? res.render(`${__dirname}/src/views/dashboard.ejs`, {
        baseurl: baseurl,
        categories: categories,
      })
    : res.json({msg: `You are not authorized`});
});

/**
 * Lists ALL of the files metadata in json format
 */
app.get("/all", async (req, res) => {
  const response = {};
  const folders = ["IMAGES", "AUDIO", "JSON"];
  for (const folder of folders) {
    const paths = await listPaths(res, folder);
    response[folder] = paths;
    console.log(`finished listing paths for ${folder} folder`);
  }
  res.send(response);
});

/**
 * Downloads Files by folder or ALL at once
 */
app.get("/drive/download", async (req, res) => {
  console.log("Downloading ENTIRE Drive");
  const ALL = "all";
  const category = !req.query.category ? ALL : req.query.category;
  const responseMsg = `downloading ${category} files from drive... Check logs for status. You can exit out of this page now.`;
  const finishMsg = `Finished Entire Download Process`;
  if (category == ALL) {
    res.send(responseMsg);
    const categories = Constants.categories;
    for (const category of categories) {
      try {
        await downloadFiles(category);
      } catch (err) {
        console.error(`err fetching category ${category}`, err);
      }
    }
    console.log(finishMsg);
    return;
  }
  res.send(responseMsg);
  await downloadFiles(category);
  console.log(finishMsg);
});

/**
 * Programatically add File to Drive
 */
app.post("/upload-file", upload, async (req, res) => {
  if (!req.file || !req.file) {
    return res.status(400).json({message: "No file found. Not uploaded"});
  }

  const file = req.file;
  const category = req?.body?.category;
  const folder = req?.body?.folder;
  const filePath = path.join(
    __dirname,
    "public",
    category,
    folder,
    file.filename
  );

  // Ensure directory exists
  try {
    fs.mkdirSync(path.dirname(filePath), {recursive: true});
  } catch (mkdirError) {
    console.error("Error creating directory:", mkdirError);
    return res.status(500).json({
      message: "Failed to create upload directory",
      error: mkdirError.message,
    });
  }

  const fileOptions = {
    filename: file.filename,
    mimetype: file.mimetype,
    filepath: filePath,
  };

  console.log("fileOptions: ", fileOptions);

  res.status(200).send({
    message: `File will be uploaded to ${category}/${folder} folder`,
    url: `${baseurl}/${category}/${folder}/${file.filename}`,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    fieldname: file.fieldname,
  });

  await uploadFileToDrive(fileOptions, folder);
});

/**
 * Add a New Folder to the Drive under a specific Category
 */
app.post("/drive/folders", async (req, res) => {
  const folderName = req?.body?.folder;
  const category = req?.body?.category;
  if (!categories.includes(category))
    return res
      .status(400)
      .send(`Category must be one of "IMAGES", "AUDIO", or "JSON"`);
  res.send(`Folder ${folderName} will be created under category ${category}`);

  await addNewFolder(folderName, category);
});

app.get("/drive/folders", async (req, res) => {
  if (req?.query?.category && categories.includes(req?.query?.category)) {
    console.log(`Returning all folders under category ${req?.query?.category}`);
    return res.send(await getFolderNames(req?.query?.category));
  }

  console.log(`Returning all folders under all categories`);
  const IMAGES = await getFolderNames("IMAGES");
  const AUDIO = await getFolderNames("AUDIO");
  const JSON = await getFolderNames("JSON");
  return res.send(IMAGES.concat(AUDIO, JSON));
});

app.listen(PORT || 8000, () =>
  console.log(`Listening to ${env} server on PORT ${PORT}`)
);
