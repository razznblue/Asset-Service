import dotenv from 'dotenv';
dotenv.config();

const driveFolderIds = {
  CARD_FRONTS: process.env.DRIVE_CARD_FRONTS,
  CARD_BACKS: process.env.DRIVE_CARD_BACKS,
  DECKS: process.env.DRIVE_DECKS,
  LOCATIONS: process.env.DRIVE_LOCATIONS,
  OBJECTS: process.env.DRIVE_OBJECTS,
  BACKGROUNDS: process.env.DRIVE_BACKGROUNDS,
  ICONS: process.env.DRIVE_ICONS,

  AUDIO: process.env.DRIVE_AUDIO,
  
  JSON: process.env.DRIVE_JSON,
}

export const getId = (folderName) => {
  return driveFolderIds[folderName];
}

const getMnemonic = (id) => {
  return Object.keys(driveFolderIds).find(key => driveFolderIds[key] === id);
}