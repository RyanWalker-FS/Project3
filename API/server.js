require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", 
    credentials: true, 
  })
);

app.get("/", (req, res) => {
  res.send("Spotify Auth Backend Running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
