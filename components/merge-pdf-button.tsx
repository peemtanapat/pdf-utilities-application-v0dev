"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { usePDFStore } from "@/lib/pdf-store"
import { mergePDFs } from "@/lib/pdf-actions"
import { downloadFile } from "@/lib/client-utils"
import { Loader2Icon, MergeIcon } from "lucide-react"

export function MergePDFButton() {
  const { files } = usePDFStore()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleMergePDFs = async () => {
    if (files.length < 2) {
      toast({
        title: "Error",
        description: "You need at least 2 PDF files to merge",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Check total file size - increased to 100MB to match the new server limit
      const totalSize = files.reduce((sum, file) => sum + file.size, 0)
      const SERVER_SIZE_LIMIT = 100 * 1024 * 1024 // 100MB in bytes

      if (totalSize < SERVER_SIZE_LIMIT) {
        // For files under 100MB, use the direct approach
        const pdfBytes = await mergePDFs(files)
        downloadFile(pdfBytes, "merged.pdf")
      } else {
        // For extremely large files (over 100MB), use the API route approach
        const formData = new FormData()
        files.forEach((file, index) => {
          formData.append(`file-${index}`, file)
        })

        // Upload files
        const uploadResponse = await fetch("/api/merge", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload files")
        }

        const { id } = await uploadResponse.json()

        // Download the merged PDF
        const mergeUrl = `/api/merge?id=${id}`

        // Create a download link and trigger the download
        const a = document.createElement("a")
        a.href = mergeUrl
        a.download = "merged.pdf"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }

      toast({
        title: "Success",
        description: "PDFs merged successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to merge PDFs",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Button onClick={handleMergePDFs} disabled={isProcessing || files.length < 2} size="lg" className="px-8">
      {isProcessing ? (
        <>
          <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
          Merging PDFs...
        </>
      ) : (
        <>
          <MergeIcon className="mr-2 h-5 w-5" />
          Merge PDFs
        </>
      )}
    </Button>
  )
}
