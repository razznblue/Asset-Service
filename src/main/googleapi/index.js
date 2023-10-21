import path, { dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pkg from 'googleapis';
import { getId } from './driveInfo.js';
import dotenv from 'dotenv';
import { Folder } from '../../config/models/Folder.js';
dotenv.config();
const { google } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CREDS_PATH = path.join(__dirname, '..', '..', '..', 'credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.file'];

/* Initialize the auth with options */
const auth = new google.auth.GoogleAuth({
    keyFile: CREDS_PATH,
    scopes: SCOPES
});

/**
 * Uploads a single file to the Drive
 * @param {*} fileOptions (filename, filepath, mimetype)
 * @param {*} category The folder under which the file will be uploaded to
 */
export const uploadFileToDrive = async (fileOptions, folder) => {
  const driveService = google.drive({ version: 'v3', auth });
  const parentFolderId = await getFolderDriveId(folder);
  const { filename, mimetype, filepath } = fileOptions;
  console.log(`Attempting to upload file ${filename} to drive with filePath ${filepath}`);
  
  // Set the metaData and Media in preparation for file upload.
  let fileMetaData = {
    name: filename,
    parents: [parentFolderId]
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

  /*Create the file and upload it */
  const createResponse = await driveService.files.create({
    resource: fileMetaData,
    media: media,
    fields: 'id'
  });
  switch(createResponse.status) {
    case 200:
        console.log(`File [${filename}] uploaded to drive in folder [${folder}]`);
        break;
    default:
        console.error(`Error uploading [${filename}] to drive. Status: ${createResponse.status}`);
  }
}

/* Download a list of drive Files By Category */
export const downloadFiles = async (category) => {
  console.log(`starting download process for category: ${category}`);
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
      for (const folder of listResponse.data.files) {
        const listResponse = await driveService.files.list({
          q: 'trashed=false and "' + [folder.id] + '" in parents',
          fields: 'nextPageToken, files(id, name)'
        });
        console.log(`processing files under /${category}/${folder.name}...`)
        for (const file of listResponse?.data?.files) {
          await downloadFile(file.id, file.name, folder.name, category)
        }
      }
      console.log(`Finished downloading all ${category} files...`);
      return listResponse.data;
    default:
      console.error("Error downloading file data");
      return "Error downloading file data";
  }
}

/* Download a single file */
const downloadFile = async (fileId, filename, folderName, category) => {
  const driveService = google.drive({version: 'v3', auth});

  if (category) {
    const filePath = `public/${category}/${folderName}`;
    const pathExists = fs.existsSync(filePath);
    if (!pathExists) {
      fs.mkdirSync(filePath, { recursive: true });
    }
  }

  const writeStream = fs.createWriteStream(path.join(__dirname, '..', '..', '..', 'public', category, folderName, filename));
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

/* List all folders in Category */
export const getFolderNames = async (category) => {
  console.log(`tryna get folder names for category ${category}`)
  const driveService = google.drive({version: 'v3', auth});
  const folders = [];
  const parentFolderId = [matchParentFolderNameToId(category)];

  try {
    const response = await driveService.files.list({
      q: `'${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id, name)'
    });
  
    const fetchedFolders = response.data.files;

    if (fetchedFolders && fetchedFolders.length > 0) {
      fetchedFolders.forEach(async (folder) => {
        /* Create Mongo record of folder in case it DNE */
        folders.push(folder.name);
        await createFolderRecord(folder, category);
      });
    } else {
      console.log('No folders found.');
    }
  } catch(err) {
    console.error(`Error fetching folder for category ${category} -`, err?.message)
  }

  return folders;
}

export const addNewFolder = async (folderName, category) => {
  const driveService = google.drive({ version: 'v3', auth });
  const parentFolderId = [matchParentFolderNameToId(category)];

  const file = await createFolder(folderName, parentFolderId, driveService);
  const folderId = file?.data?.id;
  await createFolderRecord({ name: folderName, driveId: folderId }, category);

  // Added: Transfer owner of created folder from service account to your Google account.
  console.log(`Created new folder ${folderName} under category ${category}`);
  if (!folderId) return;
  const res2 = await driveService.permissions
    .create({
      resource: {
        type: "user",
        role: "writer",
        emailAddress: "swuniverseapi@gmail.com" 
      },
      fileId: folderId,
      fields: "id",
      transferOwnership: false,
      moveToNewOwnersRoot: true,
    })
    .catch((err) => console.log(err));
}

/**
 * Logic to create the Folder in the Drive
 */
const createFolder = async (folderName, parentFolderId, service) => {
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: parentFolderId
  };
  try {
    return await service.files.create({
      resource: fileMetadata,
      fields: 'id'
    });
  } catch(err) {
    console.error(`Error creating folder ${folderName}`)
  }
}

/**
 * Retrieve the folderId of a Category
 */
const matchParentFolderNameToId = (category) => {
  const folderId = process.env[`DRIVE_${category.toUpperCase()}`];
  console.log(`Matched Category ${category} to FolderId ${folderId}`);
  return folderId;
}

/**
 * Retrieve the folderId from the DB
 */
const getFolderDriveId = async (folderName) => {
  const folder = await Folder.findOne({name: folderName});
  if (!folder) console.error(`Folder not found with name ${folderName}`);
  else {
    return folder.driveId;
  }
}

/**
 * Creates a folder record in DB
 */
const createFolderRecord = async (folder, category) => {
  try {
    const exists = await Folder.findOne({name: folder.name});
    if (!exists) {
      const newFolder = new Folder();
      newFolder.name = folder.name;
      newFolder.driveId = folder.driveId;
      newFolder.category = category;
      await newFolder.save();
      console.log(`saved new folder ${folder.name}`);
    }
  } catch(err) {
    console.error(`Error saving folder ${folder}`, err?.message);
  }
}