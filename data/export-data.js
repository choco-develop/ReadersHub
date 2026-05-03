const fs = require("fs");
const dotenv = require("dotenv").config({ path: `${__dirname}/../config.env` });
const mongoose = require("mongoose");
const Books = require(`${__dirname}/../Models/bookModel.js`);

const DB = process.env.DATABASE.replace("<db_password>", process.env.PASSWORD);

mongoose.connect(DB).then(console.log("DataBase conected successfully"));

const data = JSON.parse(fs.readFileSync("./index.json", "utf8"));

const exportData = async () => {
  try {
    await Books.create(data);
    console.log("Created Successfully");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    console.log(process.argv);
    await Books.deleteMany();
    console.log("Successful");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  exportData();
} else if (process.argv[2] === "--delete") {
  deleteData;
}
