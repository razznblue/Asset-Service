import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { readdir } from 'fs/promises'

import Constants from '../constants/Constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const listImagePaths = async (res) => {
  const images = path.join(__dirname, '..', '..', 'public', 'images');
  const directories = await readdir(images, { withFileTypes: true });

  if (directories) {
    let response = {};
    const directoryNames = directories.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
    for (const dir of directoryNames) {
      const imgPath = path.join(__dirname, '..', '..', 'public', 'images', dir);
      const files = await readdir(imgPath, { withFileTypes: true });
      for (const file of files) {
        file.url = `${Constants.baseurl}/images/${dir}/${file.name}`;
        file.name = file.name.split('.')[0];
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
    res.send(response);
  }
}

export default listImagePaths;