import mongoose from 'mongoose';
import DocumentAnalysis, { DOCUMENT_TYPES } from '../models/DocumentAnalysis.js';
import { extractText, analyzeLeaseDocument } from '../services/documentService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const MIME_TO_TYPE = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

const listFields = 'fileName fileType documentType safetyScore summary aiGenerated createdAt';

// @route POST /api/documents/analyze — multipart form: file, documentType?
export const analyzeDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'A PDF or DOCX file is required');

  const fileType = MIME_TO_TYPE[req.file.mimetype];
  if (!fileType) throw new ApiError(400, 'Only PDF and DOCX files are supported');

  const documentType = DOCUMENT_TYPES.includes(req.body.documentType) ? req.body.documentType : 'other';

  let text;
  try {
    text = await extractText(req.file.buffer, fileType);
  } catch (error) {
    console.error('Text extraction failed:', error.message);
    throw new ApiError(400, 'Could not read this file — it may be corrupted, scanned as an image, or password-protected.');
  }

  if (!text || text.length < 50) {
    throw new ApiError(400, 'No readable text found in this document. Scanned/image-only PDFs are not supported yet.');
  }

  const analysis = await analyzeLeaseDocument(text, documentType);

  const record = await DocumentAnalysis.create({
    owner: req.user._id,
    fileName: req.file.originalname,
    fileType,
    documentType,
    textExcerpt: text.slice(0, 2000),
    ...analysis,
  });

  res.status(201).json({ success: true, analysis: record });
});

// @route GET /api/documents — my past analyses (summary fields only)
export const getMyDocuments = asyncHandler(async (req, res) => {
  const documents = await DocumentAnalysis.find({ owner: req.user._id })
    .sort({ createdAt: -1 })
    .select(listFields)
    .lean();

  res.json({ success: true, documents });
});

// @route GET /api/documents/:id — full analysis
export const getDocument = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid document id');

  const document = await DocumentAnalysis.findById(req.params.id).lean();
  if (!document) throw new ApiError(404, 'Analysis not found');
  if (document.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only view your own analyses');
  }

  res.json({ success: true, analysis: document });
});

// @route DELETE /api/documents/:id
export const deleteDocument = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid document id');

  const document = await DocumentAnalysis.findById(req.params.id);
  if (!document) throw new ApiError(404, 'Analysis not found');
  if (document.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only delete your own analyses');
  }

  await document.deleteOne();
  res.json({ success: true, message: 'Analysis deleted' });
});
