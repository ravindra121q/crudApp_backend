const express = require("express");
const { connection } = require("./Database/productDatabase");
const { router } = require("./routes/allRoutes");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(router);

app.listen(8080, async (req, res) => {
  await connection;
  console.log("server is running");
});
