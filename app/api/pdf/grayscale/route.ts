import { type NextRequest, NextResponse } from "next/server"
import { convertPDFToGrayscale } from "@/lib/pdf-grayscale"
import { convertPDFToGrayscaleAlternative } from "@/lib/pdf-grayscale-alt"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert the file to an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    try {
      // Try the primary method first
      const grayscalePdfBytes = await convertPDFToGrayscale(arrayBuffer)

      return new NextResponse(grayscalePdfBytes, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="grayscale-${file.name}"`,
        },
      })
    } catch (primaryError) {
      console.error("Primary grayscale method failed, trying alternative method:", primaryError)

      // Try the alternative method
      const grayscalePdfBytes = await convertPDFToGrayscaleAlternative(arrayBuffer)

      return new NextResponse(grayscalePdfBytes, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="grayscale-${file.name}"`,
        },
      })
    }
  } catch (error) {
    console.error("Error converting PDF to grayscale:", error)
    return NextResponse.json(
      {
        error: `Failed to convert PDF to grayscale: ${error.message}`,
      },
      { status: 500 },
    )
  }
}
