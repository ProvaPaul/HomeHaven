import { Router } from 'express';
import multer from 'multer';
import { analyzeDocument, getMyDocuments, getDocument, deleteDocument } from '../controllers/documentController.js';
import { protect } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED_MIMES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIMES.has(file.mimetype)) {
      return cb(new ApiError(400, 'Only PDF and DOCX files are supported'));
    }
    cb(null, true);
  },
});

// Converts multer's raw errors (e.g. file-too-large) into the app's error shape
const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') return next(new ApiError(400, 'File exceeds the 8MB limit'));
    next(err instanceof ApiError ? err : new ApiError(400, err.message));
  });
};

const router = Router();

router.use(protect);
router.use(rateLimit({ windowMs: 60000, max: 10 }));

router.post('/analyze', handleUpload, analyzeDocument);
router.get('/', getMyDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);

export default router;
