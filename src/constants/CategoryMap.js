const CategoryMap = {
  images: [
    'CARD_FRONTS',
    'CARD_BACKS',
    'CARD_HEROS',
    'CARD_REMNANTS',
    'CARD_OBJECTS',
    'SPRITES',
    'BACKGROUNDS',
    'GAME_TILES'
  ],
  audio: [
    'LOFI',
    'HIPHOP',
    'SFX'
  ],
  json: [
    'CHARACTERS',
    'GEAR',
    'ABILITIES'
  ]
}

const getParentCategory = (category) => {
  for (const image of CategoryMap.images) {
    if (category === image) {
      return 'images';
    }
  }

  for (const aud of CategoryMap.audio) {
    if (category === aud) {
      return 'audio';
    }
  }

  for (const js of CategoryMap.json) {
    if (category === js) {
      return 'json';
    }
  }
}

export default getParentCategory;