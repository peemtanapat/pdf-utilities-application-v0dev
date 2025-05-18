import { PDFDocument } from "pdf-lib"

/**
 * Attempts to unlock a PDF using the provided password
 * @param pdfData ArrayBuffer containing the PDF data
 * @param password Password to use for unlocking
 * @returns ArrayBuffer containing the unlocked PDF data
 */
export async function unlockPDFDocument(pdfData: ArrayBuffer, password: string): Promise<Uint8Array> {
  try {
    // First, try to load the PDF with the password
    const pdfDoc = await PDFDocument.load(pdfData, { password })

    // If we get here, the password was correct
    // Check if the document is actually encrypted
    if (!pdfDoc.isEncrypted) {
      throw new Error("This PDF is not password protected")
    }

    // Create a new document
    const newPdfDoc = await PDFDocument.create()

    // Copy all pages from the original document to the new one
    const copiedPages = await newPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices())
    copiedPages.forEach((page) => {
      newPdfDoc.addPage(page)
    })

    // Copy document metadata
    if (pdfDoc.getTitle()) newPdfDoc.setTitle(pdfDoc.getTitle())
    if (pdfDoc.getAuthor()) newPdfDoc.setAuthor(pdfDoc.getAuthor())
    if (pdfDoc.getSubject()) newPdfDoc.setSubject(pdfDoc.getSubject())
    if (pdfDoc.getKeywords()) newPdfDoc.setKeywords(pdfDoc.getKeywords())
    if (pdfDoc.getCreator()) newPdfDoc.setCreator(pdfDoc.getCreator())
    if (pdfDoc.getProducer()) newPdfDoc.setProducer(pdfDoc.getProducer())
    if (pdfDoc.getCreationDate()) newPdfDoc.setCreationDate(pdfDoc.getCreationDate())
    if (pdfDoc.getModificationDate()) newPdfDoc.setModificationDate(pdfDoc.getModificationDate())

    // Save the new document (which will be unencrypted)
    return await newPdfDoc.save()
  } catch (error) {
    // Check if the error is related to encryption
    if (error.message.includes("encrypted")) {
      throw new Error("Incorrect password for this PDF")
    }
    throw error
  }
}
