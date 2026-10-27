import { jsPDF } from 'jspdf';
import { MaritimeProject } from '../types/maritime';

/**
 * Format currency to USD string
 */
function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Generate and download an executive Maritime Project Dossier PDF for a single project
 */
export function generateSingleProjectPDF(project: MaritimeProject): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header Banner - Navy Background
  doc.setFillColor(11, 24, 48); // Deep Maritime Navy
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Accent Line - Cyan Blue
  doc.setFillColor(56, 189, 248);
  doc.rect(0, 38, pageWidth, 2, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MARITEX RAG — MARITIME EXPO DOSSIER', margin, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(`EXTRACTED VIA RAG PIPELINE | EXPO BOOTH: ${project.expoBoothNumber.toUpperCase()}`, margin, 24);
  doc.text(`GENERATED: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, margin, 30);

  // Status Badge on top right
  doc.setFillColor(15, 118, 110); // Teal
  doc.roundedRect(pageWidth - margin - 48, 12, 48, 16, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(project.status.toUpperCase(), pageWidth - margin - 24, 22, { align: 'center' });

  y = 48;

  // Project Title Block
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(project.name, margin, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(14, 116, 144); // Cyan 700
  doc.text(`${project.vesselType.toUpperCase()} | ${project.imoNumber}`, margin, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const summaryLines = doc.splitTextToSize(project.summary, contentWidth);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 4.5 + 4;

  // SECTION 1: KEY METRICS GRID
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'D');

  const colWidth = contentWidth / 4;
  
  // Col 1: Contract Value
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('CONTRACT BUDGET', margin + 4, y + 6);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(formatUSD(project.contractValue), margin + 4, y + 14);

  // Col 2: Progress
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('BUILD PROGRESS', margin + colWidth + 4, y + 6);
  doc.setFontSize(11);
  doc.setTextColor(16, 185, 129); // Green
  doc.text(`${project.progressPercent}% Completed`, margin + colWidth + 4, y + 14);

  // Col 3: Delivery Date
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TARGET DELIVERY', margin + colWidth * 2 + 4, y + 6);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(project.deliveryDate, margin + colWidth * 2 + 4, y + 14);

  // Col 4: Shipyard
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PRIMARY SHIPYARD', margin + colWidth * 3 + 4, y + 6);
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const shipyardText = doc.splitTextToSize(project.shipyard, colWidth - 8);
  doc.text(shipyardText[0] || '', margin + colWidth * 3 + 4, y + 13);

  y += 28;

  // SECTION 2: TECHNICAL SPECIFICATIONS
  doc.setFillColor(14, 116, 144);
  doc.rect(margin, y, 3, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('VESSEL & TECHNICAL SPECIFICATIONS', margin + 6, y + 5.5);
  y += 10;

  const specRows: Array<[string, string, string, string]> = [
    ['Length Overall (LOA)', project.technicalSpecs.lengthOverall, 'Beam (Width)', project.technicalSpecs.beam],
    ['Design Draft', project.technicalSpecs.draft, 'Deadweight Tonnage', project.technicalSpecs.deadweight],
    ['Propulsion Plant', project.technicalSpecs.propulsion, 'Fuel System', project.technicalSpecs.fuelType],
    ['Speed & Dynamics', project.technicalSpecs.speedKnots, 'Autonomy Level', project.technicalSpecs.autonomyLevel]
  ];

  doc.setFontSize(8.5);
  specRows.forEach((row, i) => {
    const rowY = y + i * 7.5;
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, rowY - 1.5, contentWidth, 7.5, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(row[0] + ':', margin + 4, rowY + 3.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(row[1], margin + 50, rowY + 3.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(row[2] + ':', margin + contentWidth / 2 + 4, rowY + 3.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(row[3], margin + contentWidth / 2 + 44, rowY + 3.5);
  });

  y += specRows.length * 7.5 + 8;

  // SECTION 3: MILESTONES & TIMELINE
  doc.setFillColor(14, 116, 144);
  doc.rect(margin, y, 3, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('KEY MILESTONES & SEA TRIALS SCHEDULE', margin + 6, y + 5.5);
  y += 10;

  project.milestones.slice(0, 4).forEach((m) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(m.status === 'completed' ? 16 : m.status === 'in-progress' ? 217 : 100, 
                     m.status === 'completed' ? 185 : m.status === 'in-progress' ? 119 : 116, 
                     m.status === 'completed' ? 129 : m.status === 'in-progress' ? 6 : 139);
    doc.text(`[${m.status.toUpperCase()}] ${m.date}`, margin + 4, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(m.title, margin + 42, y);

    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(m.notes, margin + 42, y);

    y += 5;
  });

  y += 4;

  // SECTION 4: INGESTED WHATSAPP & COMMUNICATIONS AUDIT TRAIL
  doc.setFillColor(14, 116, 144);
  doc.rect(margin, y, 3, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('INGESTED WHATSAPP & STAKEHOLDER CHAT LOGS (RAG VERIFIED)', margin + 6, y + 5.5);
  y += 9;

  project.chatSources.slice(0, 3).forEach((chat) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    const boxHeight = 15;
    doc.roundedRect(margin, y, contentWidth, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(16, 185, 129); // Green for WhatsApp
    doc.text(`${chat.source.toUpperCase()} CHAT`, margin + 4, y + 4.5);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(`${chat.sender} • ${chat.timestamp}`, margin + 30, y + 4.5);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    const msgText = doc.splitTextToSize(`"${chat.message}"`, contentWidth - 8);
    doc.text(msgText[0] || '', margin + 4, y + 9.5);
    if (msgText[1]) {
      doc.text(msgText[1], margin + 4, y + 13);
    }

    y += boxHeight + 3;
  });

  // Footer on bottom of page
  doc.setFillColor(241, 245, 249);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Maritex RAG Intelligence Pipeline • Official Maritime Expo Documentation System', margin, pageHeight - 5);
  doc.text(`Lead: ${project.leadEngineer}`, pageWidth - margin - 60, pageHeight - 5);

  // Trigger browser download
  const safeFilename = `${project.code}_Maritime_Dossier.pdf`.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(safeFilename);
}

/**
 * Generate full 10-project Maritime Expo Catalog PDF
 */
export function generateExpoCatalogPDF(projects: MaritimeProject[]): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // COVER / SUMMARY PAGE
  doc.setFillColor(11, 24, 48);
  doc.rect(0, 0, pageWidth, 60, 'F');
  doc.setFillColor(56, 189, 248);
  doc.rect(0, 60, pageWidth, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('MARITEX RAG PIPELINE', margin, 24);

  doc.setFontSize(13);
  doc.setTextColor(56, 189, 248);
  doc.text('Official Maritime Expo Portfolio & Project Intelligence Report', margin, 34);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`PORTFOLIO COMPRISING 10 STRATEGIC MARITIME PROJECTS • RAG INDEXED`, margin, 44);
  doc.text(`GENERATED: ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}`, margin, 52);

  let y = 74;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('EXECUTIVE PORTFOLIO INDEX & CAPITAL ALLOCATION', margin, y);
  y += 8;

  const totalCap = projects.reduce((acc, p) => acc + p.contractValue, 0);

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('TOTAL CONTRACT CAPITAL MANAGED:', margin + 6, y + 6);
  doc.text('ACTIVE EXPO PROJECTS:', margin + contentWidth / 2 + 6, y + 6);

  doc.setFontSize(12);
  doc.setTextColor(14, 116, 144);
  doc.text(formatUSD(totalCap), margin + 6, y + 12);
  doc.setTextColor(16, 185, 129);
  doc.text(`${projects.length} Vessels & Systems`, margin + contentWidth / 2 + 6, y + 12);

  y += 24;

  // Project table list
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('#', margin + 3, y + 5.5);
  doc.text('PROJECT NAME', margin + 12, y + 5.5);
  doc.text('CATEGORY', margin + 62, y + 5.5);
  doc.text('IMO / REF', margin + 104, y + 5.5);
  doc.text('BUDGET', margin + 132, y + 5.5);
  doc.text('STATUS', margin + 158, y + 5.5);
  y += 8;

  projects.forEach((p, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 14, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 14, margin + contentWidth, y + 14);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${idx + 1}`, margin + 3, y + 5.5);
    doc.text(p.name, margin + 12, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(p.category, margin + 62, y + 5.5);
    doc.text(p.imoNumber || p.code, margin + 104, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(formatUSD(p.contractValue), margin + 132, y + 5.5);

    doc.setFontSize(7);
    doc.setTextColor(16, 185, 129);
    doc.text(`${p.progressPercent}% (${p.status})`, margin + 158, y + 5.5);

    // Subline: shipyard and delivery
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Shipyard: ${p.shipyard} | Target Handover: ${p.deliveryDate} | Booth: ${p.expoBoothNumber}`, margin + 12, y + 10.5);

    y += 14;
  });

  // Footer
  doc.setFillColor(241, 245, 249);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Maritex RAG Intelligence Pipeline • Complete Maritime Expo Portfolio Catalogue', margin, pageHeight - 5);
  doc.text('Page 1 of 1', pageWidth - margin - 20, pageHeight - 5);

  doc.save('Maritex_Expo_Full_Portfolio_Report.pdf');
}
