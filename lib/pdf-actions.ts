"use server"

import { PDFDocument } from "pdf-lib"
import { unlockPDFDocument } from "@/lib/pdf-unlock"
import { convertPDFToGrayscale } from "@/lib/pdf-grayscale"

// Server-side function that returns the merged PDF bytes
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
    return await unlockPDFDocument(arrayBuffer, password)
  } catch (error) {
    console.error("Error unlocking PDF:", error)
    throw error
  }
}

export async function convertToGrayscale(file: File): Promise<Uint8Array> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    return await convertPDFToGrayscale(arrayBuffer)
  } catch (error) {
    console.error("Error converting PDF to grayscale:", error)
    throw error
  }
}
