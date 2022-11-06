const driveFolderIds = {
  images: {
    CARD_FRONTS: '1hB-cCDlkogsLMQInZuWwJXI5rYgftlSU',
    CARD_BACKS: '1x1s2HpHk0JfpZn2nEyLBgfzgfpbCkUEG',
    CARD_HEROS: '1OxQpptNpt942kVUK1sdhZqZmtr0Hzy8N',
    CARD_REMNANTS: '1XwDDUvFBcfyGQsPJXV6KVOiuo6w4pxL7',
    SPRITES: '1Ipd9Dkybb-j6rpDlSpbOSE1LJsRqINQ0',
    BACKGROUNDS: '1wfea8f_Ac2ar6oII9y_frWxDhiGz5vS2',
    GAME_TILES: '1Uhrcp4M5rxzlb8WEixqVI-j__bBft3il'
  },
  audio: {
    LOFI: '1gay5i4p03L9xi3-7uydsiJqt6VXp4Qnr',
    HIPHOP: '1UN3vcEzYtNKlPJk8tyLRtvmvaOqyOwEx',
    SFX: '1zAO-IPyh0-hf4z_LoPsBQycNiWpIust8'
  },
  json: {
    CHARACTERS: '1PIGS2ckP1YYOQSdrv4jI7Djel0K3r6Yp',
    GEAR: '1JVvtcZjU44ToHBTb3trdgHa65hlamD9E',
    ABILITIES: '1hVIkFnypDI_UxPNSgI-vM4jh_UaOGdZs'
  }
}

export const getId = (folderName) => {
  if (driveFolderIds.images[folderName]) {
    return driveFolderIds.images[folderName];
  }
  if (driveFolderIds.audio[folderName]) {
    return driveFolderIds.audio[folderName];
  }
  if (driveFolderIds.json[folderName]) {
    return driveFolderIds.json[folderName];
  }
}

const getMnemonic = (id) => {
  return Object.keys(driveFolderIds).find(key => driveFolderIds[key] === id);
}