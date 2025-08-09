import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';

interface GenerateCertificateOptions {
  userName: string;
  level: string;
  testTitle: string;
  issuedAt?: Date;
}

export async function generateCertificatePDF(options: GenerateCertificateOptions): Promise<Buffer> {
  const { userName, level, testTitle, issuedAt = new Date() } = options;

  // Option 1: Load a PDF template file
  // const templatePath = path.join(__dirname, '../../assets/certificate_template.pdf');
  // const existingPdfBytes = fs.readFileSync(templatePath);
  // const pdfDoc = await PDFDocument.load(existingPdfBytes);

  // Option 2: Create new PDF from scratch
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);

  // Fonts
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // Draw a border
  const { width, height } = page.getSize();
  page.drawRectangle({
    x: 10,
    y: 10,
    width: width - 20,
    height: height - 20,
    borderColor: rgb(0.2, 0.4, 0.8),
    borderWidth: 3,
    opacity: 0.3,
  });

  // Title
  page.drawText('Certificate of Achievement', {
    x: 60,
    y: height - 70,
    size: 28,
    font: timesRomanBold,
    color: rgb(0.1, 0.2, 0.5),
  });

  // Subtitle
  page.drawText('This certifies that', {
    x: 60,
    y: height - 110,
    size: 16,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });

  // User Name (bold and bigger)
  page.drawText(userName, {
    x: 60,
    y: height - 140,
    size: 22,
    font: timesRomanBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Awarded level
  page.drawText(`has successfully achieved the level:`, {
    x: 60,
    y: height - 180,
    size: 14,
    font: timesRomanFont,
  });

  page.drawText(level, {
    x: 60,
    y: height - 205,
    size: 20,
    font: timesRomanBold,
    color: rgb(0.05, 0.5, 0.05),
  });

  // Test title
  page.drawText(`in the test "${testTitle}".`, {
    x: 60,
    y: height - 235,
    size: 14,
    font: timesRomanFont,
  });

  // Issue date
  page.drawText(`Issued on: ${dayjs(issuedAt).format('MMMM D, YYYY')}`, {
    x: 60,
    y: height - 270,
    size: 12,
    font: timesRomanFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Signature line
  page.drawLine({
    start: { x: 60, y: height - 320 },
    end: { x: 200, y: height - 320 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  page.drawText('Authorized Signature', {
    x: 60,
    y: height - 335,
    size: 10,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });

  // Serialize to bytes
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

// Save buffer to disk (optional helper)
export async function saveCertificatePDFToFile(buffer: Buffer, filename: string): Promise<string> {
  const outputDir = path.join(__dirname, '../../certificates');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const filePath = path.join(outputDir, filename);
  await fs.promises.writeFile(filePath, buffer);
  return filePath;
}
