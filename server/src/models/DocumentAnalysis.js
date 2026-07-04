import mongoose from 'mongoose';

export const DOCUMENT_TYPES = ['rental-agreement', 'lease-contract', 'sale-agreement', 'other'];
export const RISK_LEVELS = ['safe', 'attention', 'risky'];

const riskItemSchema = new mongoose.Schema(
  {
    clause: { type: String, required: true, trim: true, maxlength: 200 },
    level: { type: String, enum: RISK_LEVELS, required: true },
    explanation: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const documentAnalysisSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true, trim: true },
    fileType: { type: String, enum: ['pdf', 'docx'], required: true },
    documentType: { type: String, enum: DOCUMENT_TYPES, default: 'other' },
    textExcerpt: { type: String, default: '', maxlength: 2000 },

    extraction: {
      rentAmount: { type: String, default: 'Not specified' },
      securityDeposit: { type: String, default: 'Not specified' },
      leaseDuration: { type: String, default: 'Not specified' },
      noticePeriod: { type: String, default: 'Not specified' },
      renewalTerms: { type: String, default: 'Not specified' },
      maintenanceResponsibility: { type: String, default: 'Not specified' },
      utilityResponsibility: { type: String, default: 'Not specified' },
      hiddenCharges: { type: String, default: 'Not specified' },
      latePaymentPenalty: { type: String, default: 'Not specified' },
      terminationConditions: { type: String, default: 'Not specified' },
    },

    riskAnalysis: { type: [riskItemSchema], default: [] },
    safetyScore: { type: Number, min: 0, max: 100, default: 50 },
    summary: { type: String, default: '' },
    importantClauses: { type: [String], default: [] },
    negotiationPoints: { type: [String], default: [] },
    questionsForLandlord: { type: [String], default: [] },
    aiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

documentAnalysisSchema.index({ owner: 1, createdAt: -1 });

const DocumentAnalysis = mongoose.model('DocumentAnalysis', documentAnalysisSchema);

export default DocumentAnalysis;
