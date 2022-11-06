import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from "fs";
import multer from "multer";

import Constants from "./src/constants/Constants.js";
import listImagePaths from "./src/main/all.js";

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
    if (category) {
      filePath = `public/images/${category}`;
      const pathExists = fs.existsSync(filePath);
      if (!pathExists) {
        fs.mkdirSync(filePath, { recursive: true });
      }
    }

    cb(null, filePath !== null ? filePath : 'public/images');
  },
  filename: (err, file, cb) => {
    cb(null, file.originalname)
  }
});

const upload = multer({
  storage: storage ,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/webp") {
      cb(null, true);
    } else {
      return cb(new Error(`Invalid mime type found: [${file.mimetype}]`));
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
  res.render(`${__dirname}/src/views/index.ejs`, { baseurl: baseurl });
});

app.get("/all", async (req, res) => {
  listImagePaths(res);
});

app.post("/upload", (req, res) => {
  uploadSingleImage(req, res, (err) => {
    if (err) { return res.status(400).send({ message: err.message }) };
    const file = req.file;
    res.status(200).send({
      message: 'File Uploaded',
      url: `${baseurl}/images/${req.body.Category}/${file.filename}`,
      filename: file.filename,
      mimetype: file.mimetype,
      originalname: file.originalname,
      size: file.size,
      fieldname: file.fieldname
    });
  });
});

app.listen(PORT || 8000, () => {
  console.log(`Listening to ${env} server on PORT ${PORT}`);
});