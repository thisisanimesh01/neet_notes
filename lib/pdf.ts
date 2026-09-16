import { PDFDocument } from "pdf-lib";

export async function getPdfPageCount(buffer: Buffer) {
  const pdf = await PDFDocument.load(buffer);
  return pdf.getPageCount();
}

export async function createPreviewPdf(buffer: Buffer, maxPages = 2) {
  const source = await PDFDocument.load(buffer);
  const pdf = await PDFDocument.create();
  const pageCount = Math.min(source.getPageCount(), maxPages);

  for (let index = 0; index < pageCount; index += 1) {
    const [copiedPage] = await pdf.copyPages(source, [index]);
    pdf.addPage(copiedPage);
  }

  return Buffer.from(await pdf.save());
}

export async function ensurePdfBuffer(file: File | Buffer) {
  if (Buffer.isBuffer(file)) {
    return file;
  }

  if (typeof file.arrayBuffer === "function") {
    return Buffer.from(await file.arrayBuffer());
  }

  return Buffer.from([]);
}
