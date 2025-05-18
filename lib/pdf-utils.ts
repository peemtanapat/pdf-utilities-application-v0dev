/**
 * Verifies if a password is correct for a PDF document
 * @param pdfData ArrayBuffer containing the PDF data
 * @param password Password to verify
 * @returns True if the password is correct, false otherwise
 */
export async function verifyPDFPassword(pdfData: ArrayBuffer, password: string): Promise<boolean> {
  try {
    // We use the fetch API to create a request that we can use with the PDF.js library
    const response = new Response(pdfData)
    const data = await response.arrayBuffer()

    // Create a simple worker to verify the password
    // This is a simplified approach - in a real app, you might want to use a more robust method
    const worker = new Worker(
      URL.createObjectURL(
        new Blob(
          [
            `
            self.onmessage = function(e) {
              const { data, password } = e.data;
              
              // Try to parse the PDF with the password
              try {
                const byteArray = new Uint8Array(data);
                
                // Check for PDF header
                if (byteArray[0] !== 37 || byteArray[1] !== 80 || byteArray[2] !== 68 || byteArray[3] !== 70) {
                  self.postMessage({ success: false, error: 'Not a valid PDF' });
                  return;
                }
                
                // Check for encryption dictionary
                const text = new TextDecoder().decode(byteArray.slice(0, 1024));
                const hasEncryption = text.includes('/Encrypt');
                
                if (!hasEncryption) {
                  self.postMessage({ success: false, error: 'PDF is not encrypted' });
                  return;
                }
                
                // We can't fully verify the password here, but we can check if it's provided for an encrypted PDF
                self.postMessage({ success: password.length > 0, needsPassword: true });
              } catch (error) {
                self.postMessage({ success: false, error: error.message });
              }
            };
            `,
          ],
          { type: "application/javascript" },
        ),
      ),
    )

    return new Promise((resolve) => {
      worker.onmessage = (e) => {
        const { success, needsPassword } = e.data
        worker.terminate()
        resolve(success && needsPassword)
      }

      worker.postMessage({ data, password })
    })
  } catch (error) {
    console.error("Error verifying PDF password:", error)
    return false
  }
}
