const CategoryMap = {
  images: [
    'CARD_FRONTS',
    'CARD_BACKS',
    'DECKS',
    'LOCATIONS',
    'OBJECTS',
    'ICONS',
    'BACKGROUNDS'
  ],
  audio: [
    'AUDIO'
  ],
  json: [
    'JSON'
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