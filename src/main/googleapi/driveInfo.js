import dotenv from 'dotenv';
dotenv.config();

const driveFolderIds = {
  IMAGES: process.env.DRIVE_IMAGES,
  AUDIO: process.env.DRIVE_AUDIO,
  JSON: process.env.DRIVE_JSON,
}

export const getId = (folderName) => {
  return driveFolderIds[folderName];
}

const getMnemonic = (id) => {
  return Object.keys(driveFolderIds).find(key => driveFolderIds[key] === id);
}