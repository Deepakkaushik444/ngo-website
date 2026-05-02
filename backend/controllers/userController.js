// controllers/userController.js
const User = require("../models/User");

// Add User
exports.addUser = async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json(user);
};

// Get Users
exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};