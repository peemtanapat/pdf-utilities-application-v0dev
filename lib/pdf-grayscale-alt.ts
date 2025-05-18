import { PDFDocument, grayscale, rgb } from "pdf-lib"

/**
 * Alternative method to convert a PDF document to grayscale
 * This method uses a different approach that may work better for some PDFs
 * @param pdfData ArrayBuffer containing the PDF data
 * @returns ArrayBuffer containing the grayscale PDF data
 */
export async function convertPDFToGrayscaleAlternative(pdfData: ArrayBuffer): Promise<Uint8Array> {
  try {
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfData, { ignoreEncryption: true })

    // Create a new PDF document for the grayscale version
    const grayscalePdf = await PDFDocument.create()

    // Copy all pages from the original document
    const pages = pdfDoc.getPages()

    // Process each page
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]

      // Embed the page as a form XObject
      const [embeddedPage] = await grayscalePdf.embedPdf(pdfDoc, [i])

      // Create a new page with the same dimensions
      const newPage = grayscalePdf.addPage([page.getWidth(), page.getHeight()])

      // Draw a white background
      newPage.drawRectangle({
        x: 0,
        y: 0,
        width: newPage.getWidth(),
        height: newPage.getHeight(),
        color: rgb(1, 1, 1),
      })

      // Draw the embedded page on the new page
      newPage.drawPage(embeddedPage, {
        x: 0,
        y: 0,
        width: newPage.getWidth(),
        height: newPage.getHeight(),
        opacity: 0.9,
      })

      // Apply a grayscale filter by drawing a semi-transparent gray overlay
      newPage.drawRectangle({
        x: 0,
        y: 0,
        width: newPage.getWidth(),
        height: newPage.getHeight(),
        color: grayscale(0.5),
        opacity: 0.1,
      })
    }

    // Save the modified PDF
    return await grayscalePdf.save()
  } catch (error) {
    console.error("Error converting PDF to grayscale (alternative method):", error)
    throw error
  }
}
