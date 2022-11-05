import express from "express";
const app = express();
const PORT = '8081'

app.get("/", (req, res) => {
  res.send(`SWGU MEDIA LIBRARY`);
});

app.listen(PORT || 3005, () => {
  console.log(`Listening on PORT ${PORT}`);
});