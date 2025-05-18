import { type NextRequest, NextResponse } from "next/server"
import { PDFDocument } from "pdf-lib"
import { mkdir, writeFile, readdir, readFile, unlink, rmdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { existsSync } from "fs"

// Helper function to ensure temp directory exists
async function ensureTempDir() {
  const tempDir = join(process.cwd(), "tmp")
  if (!existsSync(tempDir)) {
    await mkdir(tempDir, { recursive: true })
  }
  return tempDir
}

// Handle the initial file upload
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const tempDir = await ensureTempDir()
    const mergeId = uuidv4()
    const mergeDir = join(tempDir, mergeId)
    await mkdir(mergeDir, { recursive: true })

    // Extract files from formData
    const filePromises = []
    let fileIndex = 0
    const fileOrder = []

    // Process each file in the formData
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const fileName = `${fileIndex}.pdf`
        const filePath = join(mergeDir, fileName)
        const buffer = Buffer.from(await value.arrayBuffer())
        filePromises.push(writeFile(filePath, buffer))
        fileOrder.push({ index: fileIndex, name: value.name })
        fileIndex++
      }
    }

    // Wait for all files to be written
    await Promise.all(filePromises)

    // Write the file order information
    await writeFile(join(mergeDir, "order.json"), JSON.stringify(fileOrder))

    // Return the merge ID for later retrieval
    return NextResponse.json({ id: mergeId })
  } catch (error) {
    console.error("Error preparing PDF merge:", error)
    return NextResponse.json({ error: "Failed to process files" }, { status: 500 })
  }
}

// Handle the merge processing and return the merged PDF
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const mergeId = url.searchParams.get("id")

    if (!mergeId) {
      return NextResponse.json({ error: "Missing merge ID" }, { status: 400 })
    }

    const tempDir = await ensureTempDir()
    const mergeDir = join(tempDir, mergeId)

    if (!existsSync(mergeDir)) {
      return NextResponse.json({ error: "Invalid merge ID" }, { status: 404 })
    }

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create()

    // Get list of files in the merge directory
    const files = await readdir(mergeDir)
    const pdfFiles = files.filter((file) => file.endsWith(".pdf"))

    // Read the order file if it exists
    let fileOrder = []
    try {
      const orderFile = join(mergeDir, "order.json")
      if (existsSync(orderFile)) {
        const orderData = await readFile(orderFile, "utf8")
        fileOrder = JSON.parse(orderData)
      }
    } catch (orderError) {
      console.error("Error reading order file:", orderError)
      // If order file can't be read, use alphabetical order
      pdfFiles.sort()
    }

    // Process each file in the correct order
    for (const fileInfo of fileOrder) {
      try {
        const filePath = join(mergeDir, `${fileInfo.index}.pdf`)
        if (existsSync(filePath)) {
          const fileData = await readFile(filePath)

          // Load the PDF document
          const pdfDoc = await PDFDocument.load(fileData, { ignoreEncryption: true })

          // Copy pages from the source document to the merged document
          const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())
          copiedPages.forEach((page) => {
            mergedPdf.addPage(page)
          })
        }
      } catch (fileError) {
        console.error(`Error processing file ${fileInfo.name}:`, fileError)
        // Continue with other files even if one fails
      }
    }

    // Serialize the merged PDF to bytes
    const mergedPdfBytes = await mergedPdf.save()

    // Clean up the temporary files
    try {
      for (const file of files) {
        await unlink(join(mergeDir, file))
      }
      await rmdir(mergeDir)
    } catch (cleanupError) {
      console.error("Error cleaning up temporary files:", cleanupError)
      // Continue even if cleanup fails
    }

    // Return the merged PDF
    return new NextResponse(mergedPdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=merged.pdf",
      },
    })
  } catch (error) {
    console.error("Error processing PDF merge:", error)
    return NextResponse.json({ error: "Failed to merge PDFs" }, { status: 500 })
  }
}
