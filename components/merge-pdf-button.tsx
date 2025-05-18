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
      // Get the merged PDF bytes from the server
      const pdfBytes = await mergePDFs(files)

      // Download the file on the client side
      downloadFile(pdfBytes, "merged.pdf")

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
