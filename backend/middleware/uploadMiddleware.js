const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ngo_videos",
    resource_type: "video",
  },
});

const upload = multer({ storage });

module.exports = upload;
