import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs';
import { readdir } from 'fs/promises'

import Constants from '../constants/Constants.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const listPaths = async (res, folderName) => {
  console.log(`Listing paths for baseurl ${Constants.baseurl}`);
  if (!fs.existsSync(path.join(__dirname, '..', '..', 'public', folderName))) {
    return {'msg': `${folderName} data not found. Try triggering a download from the home page`};
  }
  const folderPath = path.join(__dirname, '..', '..', 'public', folderName);
  const directories = await readdir(folderPath, { withFileTypes: true });

  if (directories) {
    let response = {};
    const directoryNames = directories.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
    for (const dir of directoryNames) {
      const resourcePath = path.join(__dirname, '..', '..', 'public', folderName, dir);
      const files = await readdir(resourcePath, { withFileTypes: true });
      for (const file of files) {
        file.url = `${Constants.baseurl}/${folderName}/${dir}/${file.name}`;
        file.name = file.name;
      }
      response[dir] = {
        files: files,
      }
    }


    response = Object.keys(response).sort()
      .reduce((accumulator, key) => {
        accumulator[key] = response[key];
        return accumulator;
    }, {});
    return response;
  }
}

export default listPaths;