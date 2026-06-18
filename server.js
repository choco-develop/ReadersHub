process.on("uncaughtException", (err) => {
  console.log(`Shuttting Down 💥💥💥💥💥:${err}`);
  process.exit(1);
});
const dotenv = require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");
const app = require("./App");
const port = process.env.PORT;
const DB = process.env.DATABASE.replace("<db_password>", process.env.PASSWORD);

mongoose
  .connect(DB)
  .then(() => console.log(`DB connected successfully ${process.env.DATABASE}`));

const server = app.listen(port, console.log(`Listening at ${port}`));
process.on("unhandledRejection", (err) => {
  console.log(`Shutting Down: ${err}`);
  server.close(() => process.exit(1));
});
