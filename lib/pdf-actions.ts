"use server"

import { PDFDocument } from "pdf-lib"

// Add back the mergePDFs function that was removed
export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  try {
    // Create a new PDF document
    const mergedPdf = await PDFDocument.create()

    // Process each file
    for (const file of files) {
      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()

      // Load the PDF document
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })

      // Copy pages from the source document to the merged document
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page)
      })
    }

    // Serialize the merged PDF to bytes and return them
    return await mergedPdf.save()
  } catch (error) {
    console.error("Error merging PDFs:", error)
    throw error
  }
}

export async function unlockPDF(file: File, password: string): Promise<Uint8Array> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer, { password })

    const newPdfDoc = await PDFDocument.create()
    const copiedPages = await newPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices())
    copiedPages.forEach((page) => {
      newPdfDoc.addPage(page)
    })

    const pdfBytes = await newPdfDoc.save()
    return pdfBytes
  } catch (error) {
    console.error("Error unlocking PDF:", error)
    throw error
  }
}

export async function convertToGrayscale(file: File): Promise<Uint8Array> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })

    const newPdfDoc = await PDFDocument.create()
    const copiedPages = await newPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices())
    copiedPages.forEach((page) => {
      newPdfDoc.addPage(page)
    })

    const pdfBytes = await newPdfDoc.save()
    return pdfBytes
  } catch (error) {
    console.error("Error converting PDF to grayscale:", error)
    throw error
  }
}
