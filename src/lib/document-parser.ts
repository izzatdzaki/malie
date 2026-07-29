import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function extractTextFromFile(
  buffer: Buffer,
  fileType: string
): Promise<string> {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return extractTextFromPDF(buffer);
    case 'docx':
    case 'doc':
      return extractTextFromDOCX(buffer);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}
