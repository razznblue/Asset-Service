import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from "fs";
import multer from "multer";
import cors from 'cors';

import Constants from "./src/constants/Constants.js";
import listPaths from "./src/main/all.js";
import { uploadFileToDrive, downloadFiles, addNewFolder, getFolderNames } from "./src/main/googleapi/index.js";
import getParentCategory from "./src/constants/CategoryMap.js";
import isValidMimetype from "./src/constants/MimeType.js";

dotenv.config();
const app = express();
const env = process.env.NODE_ENV;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = Constants.port;
const baseurl = Constants.baseurl;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let filePath = null;
    const category = req.body.Category;
    const parentCategory = getParentCategory(category);
    if (category) {
      filePath = `public/${parentCategory}/${category}`;
      const pathExists = fs.existsSync(filePath);
      if (!pathExists) {
        fs.mkdirSync(filePath, { recursive: true });
      }
    }

    cb(null, filePath !== null ? filePath : `public/${parentCategory}`);
  },
  filename: (err, file, cb) => {
    cb(null, file.originalname)
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (isValidMimetype(file.mimetype)) {
      cb(null, true);
    } else {
      return cb(new Error(`File not uploaded. Invalid mime type found: [${file.mimetype}]`));
    }
  }
});

const uploadSingleImage = upload.single('asset');

setInterval(async () => {
  await axios.get(Constants.baseurl);
  console.log('App Pinged');
}, 600000);

// Cors Functionality
app.use(cors({ origin: '*' }));

app.set("view engine", "ejs"); 
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  const categories = ["IMAGES", "AUDIO", "JSON"];
  res.render(`${__dirname}/src/views/index.ejs`, { baseurl: baseurl, categories: categories });
});

/**
 * Lists ALL of the files metadata in json format
 */
app.get("/all", async(req, res) => {
  const response = {}
  const folders = ['images', 'audio', 'json'];
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
app.get("/drive/download", async(req, res) => {
  const ALL = 'all'
  const category = !req.query.category ? ALL : req.query.category;
  const responseMsg = `downloading ${category} files from drive... Check logs for status. You can exit out of this page now.`;
  const finishMsg = `Finished Entire Download Process`;
  if (category == ALL) {
    res.send(responseMsg);
    const categories = Constants.categories;
    for (const category of categories) {
      await downloadFiles(category);
    }
    console.log(finishMsg);
    return;
  }
  res.send(responseMsg);
  await downloadFiles(category);
  console.log(finishMsg);
});

/**
 * UPLOADS a single file to a specific folder
 */
app.post("/upload", async (req, res) => {
  uploadSingleImage(req, res, async (err) => {
    if (err) { return res.status(400).send({ message: err.message }) };
    const file = req.file;
    const category = req.body.Category;
    const parentCategory = getParentCategory(category);
    const filePath = path.join(__dirname, 'public', parentCategory, category, file.filename );
    const fileOptions = {
      filename: file.filename,
      mimetype: file.mimetype,
      filepath: filePath
    }

    res.status(200).send({
      message: `File will be uploaded to ${parentCategory}/${category} folder`,
      url: `${baseurl}/${parentCategory}/${category}/${file.filename}`,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      fieldname: file.fieldname
    });

    await uploadFileToDrive(fileOptions, category);
  });
});

/**
 * Add a New Folder to the Drive under a specific Category
 */
app.post('/drive/folders', async (req, res) => {
  const folderName = req?.body?.folder;
  const category = req?.body?.category;
  const categories = ['IMAGES', 'AUDIO', 'JSON'];
  if (!categories.includes(category)) return res.status(400).send(`Category must be one of "IMAGES", "AUDIO", or "JSON"`);
  res.send(`Folder ${folderName} will be created under category ${category}`);

  await addNewFolder(folderName, category)

})

app.get('/drive/folders', async(req, res) => {
  const categories = ['IMAGES', 'AUDIO', 'JSON'];
  if (req?.query?.category && categories.includes(req?.query?.category)) {
    console.log(`Returning all folders under category ${req?.query?.category}`)
    return res.send(await getFolderNames(req?.query?.category));
  }

  const IMAGES = await getFolderNames('IMAGES');
  const AUDIO = await getFolderNames('AUDIO');
  const JSON = await getFolderNames('JSON');
  const folders = IMAGES.concat(AUDIO, JSON);
  console.log('FOLDER NAMES:')
  console.log(folders);
  return res.send(folders);
})

app.listen(PORT || 8000, () => {
  // Download all assets from drive after every PRODUCTION deploy
  setTimeout(async () => {
    if (process.env.NODE_ENV === 'production') {
      console.log(`Production server started. Setting up hosted assets...`);
      await axios.get(`${baseurl}/drive/download`);
    }
  }, 1000);
  console.log(`Listening to ${env} server on PORT ${PORT}`);
});