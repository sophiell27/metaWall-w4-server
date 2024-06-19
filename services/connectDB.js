const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config({
  path: './config.env',
});
const { DATABASE, DATABASE_PASSWORD } = process.env;
const DB = DATABASE.replace('<password>', DATABASE_PASSWORD);

const connectDB = () =>
  mongoose
    .connect(DB)
    .then(() => console.log('DB connected'))
    .catch(() => console.log('DB connect failed'));

module.exports = connectDB;
