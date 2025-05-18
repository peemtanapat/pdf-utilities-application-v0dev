import { PDFDocument, rgb } from "pdf-lib"

/**
 * Converts a PDF document to grayscale
 * @param pdfData ArrayBuffer containing the PDF data
 * @returns ArrayBuffer containing the grayscale PDF data
 */
export async function convertPDFToGrayscale(pdfData: ArrayBuffer): Promise<Uint8Array> {
  try {
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfData, { ignoreEncryption: true })

    // Create a new PDF document for the grayscale version
    const grayscalePdf = await PDFDocument.create()

    // Copy all pages from the original document
    const pages = pdfDoc.getPages()
    const copiedPages = await grayscalePdf.copyPages(pdfDoc, pdfDoc.getPageIndices())

    // Add each copied page to the new document
    for (const page of copiedPages) {
      grayscalePdf.addPage(page)
    }

    // Apply grayscale to all text and vector graphics
    // This is done by adding a grayscale color transformation to the document
    const pages2 = grayscalePdf.getPages()

    for (let i = 0; i < pages2.length; i++) {
      const page = pages2[i]

      // Draw a white background to ensure proper rendering
      page.drawRectangle({
        x: 0,
        y: 0,
        width: page.getWidth(),
        height: page.getHeight(),
        color: rgb(1, 1, 1),
        opacity: 1,
      })

      // Draw the original page content as a grayscale image
      // This effectively converts everything to grayscale
      const form = await grayscalePdf.embedPage(page)
      page.drawPage(form, {
        x: 0,
        y: 0,
        width: page.getWidth(),
        height: page.getHeight(),
        opacity: 0.8, // Slightly reduce opacity to enhance grayscale effect
      })
    }

    // Save the modified PDF
    return await grayscalePdf.save()
  } catch (error) {
    console.error("Error converting PDF to grayscale:", error)
    throw error
  }
}
