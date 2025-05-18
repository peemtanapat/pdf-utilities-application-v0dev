"use server"

import { PDFDocument } from "pdf-lib"

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

// Server-side function that returns the unlocked PDF bytes
export async function unlockPDF(file: File, password: string): Promise<Uint8Array> {
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // First try to load the PDF with ignoreEncryption: true to check if it's encrypted
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
    })

    // Check if the PDF is encrypted
    if (!pdfDoc.isEncrypted) {
      throw new Error("This PDF is not password protected")
    }

    // Now try to load it with the password
    try {
      const securedPdfDoc = await PDFDocument.load(arrayBuffer, {
        password,
      })

      // Save the PDF without password protection and return the bytes
      return await securedPdfDoc.save()
    } catch (passwordError) {
      console.error("Password error:", passwordError)
      throw new Error("Incorrect password for this PDF")
    }
  } catch (error) {
    console.error("Error unlocking PDF:", error)
    throw error
  }
}

// Server-side function that returns the grayscale PDF bytes
export async function convertToGrayscale(file: File): Promise<Uint8Array> {
  try {
    // Create a FormData object to send the file to the API
    const formData = new FormData()
    formData.append("file", file)

    // Call the API endpoint for grayscale conversion
    const response = await fetch("/api/pdf/grayscale", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to convert PDF to grayscale")
    }

    // Get the processed PDF as an ArrayBuffer
    const arrayBuffer = await response.arrayBuffer()
    return new Uint8Array(arrayBuffer)
  } catch (error) {
    console.error("Error converting PDF to grayscale:", error)
    throw error
  }
}
