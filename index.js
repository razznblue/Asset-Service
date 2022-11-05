import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

setInterval(async () => {
  await axios.get('https://swgu-library.onrender.com/');
  console.log('App Pinged');
}, 600000);

app.get("/", (req, res) => {
  res.send(`SWGU MEDIA LIBRARY`);
});

app.listen(PORT || 8000, () => {
  console.log(`Listening on PORT ${PORT}`);
});