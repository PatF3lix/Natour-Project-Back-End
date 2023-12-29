const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });

let DB = process.env.DATABASE.replace('<USER>', process.env.USER);
DB = DB.replace('<PASSWORD>', process.env.PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection successful');
  })
  .catch((err) => console.log(err));

//READ JSON FILE
const dataPromises = [
  JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')),
  JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8')),
  JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')),
];

//IMPORT DATA INTO DB
//Go to .config file and change the NODE_ENV to LOADER to prevent encryption

const importData = async () => {
  try {
    const [tours, users, reviews] = await Promise.all(dataPromises);
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully loaded!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

//DELETE ALL DATA FROM DB COLLECTION
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data succesfully deleted!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

//**TO FILL AND DELETE DATABASE COLLECTION, OPEN A NEW TERMINAL,
/*
    Fill up collection: node dev-data/data/import-dev-data.js --import
    delete all documents in collection: node dev-data/data/import-dev-data.js --delete
 */
