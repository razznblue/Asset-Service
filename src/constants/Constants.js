import dotenv from "dotenv";
dotenv.config();

const Constants = {
  port: process.env.PORT || 8000,
  baseurl: process.env.BASE_URL,
  categories: ["images", "audio", "json"],
};

export default Constants;
