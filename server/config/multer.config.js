const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure folder exists
function ensureDirExists(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

// Allowed MIME types (extend if needed)
const allowedMimeTypes = [
  'image/jpeg', 'image/png', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Generalized uploadFiles function
function uploadFiles({ folder = 'general', fields = [] }) {
  const basePath = path.join(__dirname, '..', 'assets', folder);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const fieldFolder = path.join(basePath);
      ensureDirExists(fieldFolder);
      cb(null, fieldFolder);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, name);
    }
  });

  const limits = {
    fileSize: 10 * 1024 * 1024, // 10 MB
  };

  const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type!'), false);
    }
  };

  return multer({ storage, limits, fileFilter }).fields(fields);
}

module.exports = uploadFiles;
