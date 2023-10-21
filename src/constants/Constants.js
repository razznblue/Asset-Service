import dotenv from 'dotenv';
dotenv.config();

const Constants = {
  port: process.env.PORT || 8000,
  baseurl: process.env.NODE_ENV === 'production' 
    ? "https://swgu-library.onrender.com"
    : `http://localhost:${process.env.PORT}`,
  categories: ['IMAGES', 'AUDIO', 'JSON']
}

export default Constants;