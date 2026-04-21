require('dotenv').config();

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = process.env.ATLASTDB;

main()
.then(() => {
    console.log("connected to DB")
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL); // ✅ ATLASTDB → MONGO_URL
}

const initDB = async () => {
   await Listing.deleteMany({});
   const data = initData.map((obj) => ({
      ...obj,
      owner: "69d77c5b9878157cd5a1ac92"
   }));
   await Listing.insertMany(data);
   console.log("data was initialized");
}

initDB();