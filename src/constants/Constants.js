import dotenv from 'dotenv';
dotenv.config();

const Constants = {
  port: process.env.PORT || 8000,
  baseurl: process.env.NODE_ENV === 'production' 
    ? "https://swgu-library.onrender.com"
    : `http://localhost:${process.env.PORT}`,
  categories: ['CARD_FRONTS', 'CARD_BACKS', 'CARD_HEROS', 'CARD_REMNANTS', 'SPRITES', 'BACKGROUNDS',
      'SFX', 'LOFI', 'HIPHOP']
}

export default Constants;