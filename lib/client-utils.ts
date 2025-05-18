"use client"

/**
 * Downloads a file from a Uint8Array
 * @param data The file data as a Uint8Array
 * @param filename The name to give the downloaded file
 * @param mimeType The MIME type of the file
 */
export function downloadFile(data: Uint8Array, filename: string, mimeType = "application/pdf") {
  // Create a Blob from the bytes
  const blob = new Blob([data], { type: mimeType })

  // Create a download link and trigger the download
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
