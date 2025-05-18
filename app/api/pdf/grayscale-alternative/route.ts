import { type NextRequest, NextResponse } from "next/server"
import { PDFDocument } from "pdf-lib"

// This is an alternative implementation that can be used if the primary method doesn't work well
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(arrayBuffer)

    // Create a new PDF document for the grayscale version
    const grayscalePdf = await PDFDocument.create()

    // Copy all pages from the original document
    const pages = pdfDoc.getPages()
    const copiedPages = await grayscalePdf.copyPages(pdfDoc, Array.from(pages.keys()))

    // Add each copied page to the new document
    for (const page of copiedPages) {
      // Add the page to the new document
      grayscalePdf.addPage(page)

      // Get the page dictionary
      const pageDictionary = page.node

      // Add a grayscale color space to the page resources
      const resources = pageDictionary.get(grayscalePdf.context.obj("Resources"))
      if (resources) {
        // Get or create the ExtGState dictionary
        let extGState = resources.get(grayscalePdf.context.obj("ExtGState"))
        if (!extGState) {
          extGState = grayscalePdf.context.obj({})
          resources.set(grayscalePdf.context.obj("ExtGState"), extGState)
        }

        // Add a grayscale color conversion state
        extGState.set(
          grayscalePdf.context.obj("GS1"),
          grayscalePdf.context.obj({
            Type: grayscalePdf.context.obj("ExtGState"),
            ca: 1,
            CA: 1,
            BM: grayscalePdf.context.obj("Normal"),
            // This is the key part - set the color conversion to DeviceGray
            DefaultGray: grayscalePdf.context.obj([
              grayscalePdf.context.obj("CalGray"),
              grayscalePdf.context.obj({
                WhitePoint: [1, 1, 1],
                Gamma: 2.2,
              }),
            ]),
          }),
        )

        // Add content to apply the grayscale state
        const gsContent = `/GS1 gs\n`
        const contentStream = await page.getContentStream()
        const newContentStream = grayscalePdf.context.contentStream([
          { operator: "q" }, // Save graphics state
          { operator: "gs", operands: [grayscalePdf.context.obj("/GS1")] }, // Apply grayscale state
          ...contentStream.operators, // Original content
          { operator: "Q" }, // Restore graphics state
        ])

        page.setContentStream(newContentStream)
      }
    }

    // Save the grayscale PDF
    const grayscalePdfBytes = await grayscalePdf.save()

    return new NextResponse(grayscalePdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="grayscale-${file.name}"`,
      },
    })
  } catch (error) {
    console.error("Error converting PDF to grayscale:", error)
    return NextResponse.json({ error: "Failed to convert PDF to grayscale" }, { status: 500 })
  }
}
