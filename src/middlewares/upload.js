const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const createStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: { folder: `healthcare/${folder}`, allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], transformation: [{ quality: 'auto' }] },
  });

const uploadSingle   = (folder, field) => multer({ storage: createStorage(folder), limits: { fileSize: 5 * 1024 * 1024 } }).single(field);
const uploadMultiple = (folder, field, max = 10) => multer({ storage: createStorage(folder), limits: { fileSize: 5 * 1024 * 1024 } }).array(field, max);

module.exports = { uploadSingle, uploadMultiple };
