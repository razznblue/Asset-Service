import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from "fs";
import multer from "multer";

import Constants from "./src/constants/Constants.js";
import listPaths from "./src/main/all.js";
import { uploadFileToDrive, downloadFiles } from "./src/main/googleapi/index.js";
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

app.set("view engine", "ejs"); 
app.use(express.static("public"));

app.get("/", (req, res) => {
  const categories = Constants.categories;
  res.render(`${__dirname}/src/views/index.ejs`, { baseurl: baseurl, categories: categories });
});

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

app.listen(PORT || 8000, () => {
  console.log(`Listening to ${env} server on PORT ${PORT}`);
});