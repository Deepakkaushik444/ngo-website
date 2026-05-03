const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect("mongodb+srv://ngobyindu:admin@cluster0.6o825zb.mongodb.net/ngo");
  console.log("MongoDB Connected ✅");
};

module.exports = connectDB;
