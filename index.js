const express = require("express");
const { default: connection } = require("./Database/productDatabase");
const { router } = require("./routes/allRoutes");
const app = express();
app.use(express.json());
app.use(router)
app.listen(8080, async (req, res) => {
  await connection;
  console.log("server is running");
});
