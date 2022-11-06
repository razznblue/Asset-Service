import path, { dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pkg from 'googleapis';
import { getId } from './driveInfo.js';
import getParentCategory from '../../constants/CategoryMap.js';
const { google } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CREDS_PATH = path.join(__dirname, '..', '..', '..', 'credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];

// Initialize the auth with options
const auth = new google.auth.GoogleAuth({
    keyFile: CREDS_PATH,
    scopes: SCOPES
});

export const uploadFileToDrive = async (fileOptions, category) => {
  const driveService = google.drive({ version: 'v3', auth });
  const parentFolderId = [getId(category)];
  const { filename, mimetype, filepath } = fileOptions;

  // Set the metaData and Media in preparation for file upload.
  let fileMetaData = {
    name: filename,
    parents: parentFolderId
  }
  let media = {
      mimeType: mimetype,
      body: fs.createReadStream(filepath)
  }

  const listResponse = await driveService.files.list({
    name: filename,
    q: 'trashed=false and "' + parentFolderId + '" in parents',
    fields: 'nextPageToken, files(id, name)'
  });

  if (listResponse.status !== 200) {
    console.error("Files Not Found Or Error occured. Response status: " + listResponse.status);
  }

  //Create the file and upload it
  const createResponse = await driveService.files.create({
    resource: fileMetaData,
    media: media,
    fields: 'id'
  });
  switch(createResponse.status) {
    case 200:
        console.log(`File [${filename}] uploaded to drive in folder [${category}]`);
        break;
    default:
        console.error(`Error uploading [${filename}] to drive. Status: ${createResponse.status}`);
  }
}

export const downloadFiles = async (category) => {
  console.log(`starting download process for category: ${category}...`);
  const driveService = google.drive({version: 'v3', auth});
  const parentFolderId = [getId(category)];
  const listResponse = await driveService.files.list({
    q: 'trashed=false and "' + parentFolderId + '" in parents',
    fields: 'nextPageToken, files(id, name)'
  });

  switch(listResponse.status) {
    case 200:
      if (listResponse.data.files.length < 1) {
        console.log(`${category} drive folder is empty`);
        return;
      }
      for (const file of listResponse.data.files) {
        await downloadFile(file.id, file.name, category);
      }
      console.log(`Finished downloading all ${category} files...`);
      return listResponse.data;
    default:
      console.error("Error downloading file data");
      return "Error downloading file data";
  }
}

const downloadFile = async (fileId, filename, category) => {
  const driveService = google.drive({version: 'v3', auth});
  const parentCategory = getParentCategory(category);

  if (category) {
    const filePath = `public/${parentCategory}/${category}`;
    const pathExists = fs.existsSync(filePath);
    if (!pathExists) {
      fs.mkdirSync(filePath, { recursive: true });
    }
  }
  const writeStream = fs.createWriteStream(path.join(__dirname, '..', '..', '..', 'public', parentCategory, category, filename));
  const response = await driveService.files.get(
    { fileId: fileId, alt: 'media'},
    { responseType: 'stream' }
  );

  switch(response.status) {
    case 200:
      response.data.pipe(writeStream);
      return;
    default:
      console.error(`Error downloading file: ${response.status}`);
  }
}