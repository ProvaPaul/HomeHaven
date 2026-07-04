import { jsPDF } from 'jspdf';
import { DOCUMENT_TYPE_LABELS } from './format';

const MARGIN = 14;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

/**
 * Generates and downloads a professional PDF report for a document analysis.
 * @param {object} analysis
 */
export function downloadAnalysisReportPdf(analysis) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = MARGIN;

  const pageBottom = 285;
  const ensureSpace = (needed) => {
    if (y + needed > pageBottom) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const addHeading = (text, size = 13) => {
    ensureSpace(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(size);
    doc.setTextColor(20, 20, 20);
    doc.text(text, MARGIN, y);
    y += size / 2.2 + 3;
  };

  const addParagraph = (text, size = 10) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(text || '—', CONTENT_WIDTH);
    for (const line of lines) {
      ensureSpace(6);
      doc.text(line, MARGIN, y);
      y += 5;
    }
    y += 2;
  };

  const addField = (label, value) => {
    ensureSpace(6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(90, 90, 90);
    doc.text(`${label}:`, MARGIN, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    const lines = doc.splitTextToSize(value || 'Not specified', CONTENT_WIDTH - 45);
    doc.text(lines, MARGIN + 45, y);
    y += Math.max(5, lines.length * 5);
  };

  const addBulletList = (items) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    for (const item of items) {
      const lines = doc.splitTextToSize(`•  ${item}`, CONTENT_WIDTH);
      for (const line of lines) {
        ensureSpace(6);
        doc.text(line, MARGIN, y);
        y += 5;
      }
    }
    y += 2;
  };

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(20, 20, 20);
  doc.text('HomeHaven — AI Document Analysis Report', MARGIN, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(110, 110, 110);
  doc.text(`${analysis.fileName}  ·  ${DOCUMENT_TYPE_LABELS[analysis.documentType] || 'Document'}`, MARGIN, y);
  y += 5;
  doc.text(`Generated ${new Date(analysis.createdAt || Date.now()).toLocaleString()}`, MARGIN, y);
  y += 5;
  if (!analysis.aiGenerated) {
    doc.setTextColor(180, 120, 0);
    doc.text('Heuristic scan (no AI key configured) — verify manually before relying on this report.', MARGIN, y);
    y += 5;
  }
  y += 3;

  // Safety score
  addHeading(`Overall Safety Score: ${analysis.safetyScore}/100`, 14);
  y += 1;

  // Summary
  addHeading('Summary');
  addParagraph(analysis.summary);

  // Key terms
  addHeading('Key Terms');
  addField('Rent Amount', analysis.extraction?.rentAmount);
  addField('Security Deposit', analysis.extraction?.securityDeposit);
  addField('Lease Duration', analysis.extraction?.leaseDuration);
  addField('Notice Period', analysis.extraction?.noticePeriod);
  addField('Renewal Terms', analysis.extraction?.renewalTerms);
  addField('Maintenance Resp.', analysis.extraction?.maintenanceResponsibility);
  addField('Utility Resp.', analysis.extraction?.utilityResponsibility);
  addField('Hidden Charges', analysis.extraction?.hiddenCharges);
  addField('Late Payment Penalty', analysis.extraction?.latePaymentPenalty);
  addField('Termination Conditions', analysis.extraction?.terminationConditions);
  y += 2;

  // Risk analysis
  if (analysis.riskAnalysis?.length) {
    addHeading('Risk Analysis');
    for (const risk of analysis.riskAnalysis) {
      const icon = risk.level === 'safe' ? '[SAFE]' : risk.level === 'risky' ? '[RISKY]' : '[ATTENTION]';
      ensureSpace(6);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text(`${icon} ${risk.clause}`, MARGIN, y);
      y += 5;
      addParagraph(risk.explanation, 9.5);
    }
  }

  // Important clauses
  if (analysis.importantClauses?.length) {
    addHeading('Important Clauses');
    addBulletList(analysis.importantClauses);
  }

  // Negotiation points
  if (analysis.negotiationPoints?.length) {
    addHeading('Possible Negotiation Points');
    addBulletList(analysis.negotiationPoints);
  }

  // Questions
  if (analysis.questionsForLandlord?.length) {
    addHeading('Questions to Ask the Landlord/Seller');
    addBulletList(analysis.questionsForLandlord);
  }

  // Footer disclaimer
  ensureSpace(14);
  y += 4;
  doc.setDrawColor(220, 220, 220);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 5;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(
    doc.splitTextToSize(
      'This report is AI-generated informational analysis, not legal advice. Always have important agreements reviewed by a qualified professional before signing.',
      CONTENT_WIDTH
    ),
    MARGIN,
    y
  );

  const safeName = analysis.fileName.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-_]+/gi, '-');
  doc.save(`homehaven-analysis-${safeName}.pdf`);
}
