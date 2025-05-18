"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { usePDFStore } from "@/lib/pdf-store"
import { mergePDFs, unlockPDF, convertToGrayscale } from "@/lib/pdf-actions"
import { downloadFile } from "@/lib/client-utils"
import { Loader2Icon, MergeIcon, UnlockIcon, FileTextIcon } from "lucide-react"

export function PDFOperations() {
  const { files } = usePDFStore()
  const { toast } = useToast()
  const [password, setPassword] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentOperation, setCurrentOperation] = useState<string | null>(null)

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
    setCurrentOperation("merge")

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
      setCurrentOperation(null)
    }
  }

  const handleUnlockPDF = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please upload a PDF file first",
        variant: "destructive",
      })
      return
    }

    if (!password) {
      toast({
        title: "Error",
        description: "Please enter the PDF password",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setCurrentOperation("unlock")

    try {
      // Get the unlocked PDF bytes from the server
      const pdfBytes = await unlockPDF(files[0], password)

      // Download the file on the client side
      downloadFile(pdfBytes, `unlocked-${files[0].name}`)

      toast({
        title: "Success",
        description: "PDF unlocked successfully",
      })
      setPassword("") // Clear password field after successful unlock
    } catch (error) {
      // Extract the error message
      const errorMessage = error instanceof Error ? error.message : "Failed to unlock PDF"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
      setCurrentOperation(null)
    }
  }

  const handleConvertToGrayscale = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please upload a PDF file first",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setCurrentOperation("grayscale")

    try {
      // Get the grayscale PDF bytes from the server
      const pdfBytes = await convertToGrayscale(files[0])

      // Download the file on the client side
      downloadFile(pdfBytes, `grayscale-${files[0].name}`)

      toast({
        title: "Success",
        description: "PDF converted to grayscale successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert PDF to grayscale",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
      setCurrentOperation(null)
    }
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-10">
        <FileTextIcon className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No PDF files uploaded</h3>
        <p className="mt-2 text-sm text-muted-foreground">Please upload PDF files first to perform operations</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MergeIcon className="h-5 w-5" />
            Merge PDFs
          </CardTitle>
          <CardDescription>Combine multiple PDF files into a single document</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {files.length < 2 ? "You need at least 2 PDF files to merge" : `${files.length} files selected for merging`}
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleMergePDFs} disabled={isProcessing || files.length < 2} className="w-full">
            {isProcessing && currentOperation === "merge" ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Merging...
              </>
            ) : (
              "Merge PDFs"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UnlockIcon className="h-5 w-5" />
            Unlock PDF
          </CardTitle>
          <CardDescription>Remove password protection from a PDF file</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">PDF Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          <p className="text-xs text-muted-foreground">Only the first selected PDF will be processed</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUnlockPDF} disabled={isProcessing || !password} className="w-full">
            {isProcessing && currentOperation === "unlock" ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Unlocking...
              </>
            ) : (
              "Unlock PDF"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileTextIcon className="h-5 w-5" />
            Convert to Grayscale
          </CardTitle>
          <CardDescription>Convert a color PDF to grayscale</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Only the first selected PDF will be processed</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleConvertToGrayscale} disabled={isProcessing} className="w-full">
            {isProcessing && currentOperation === "grayscale" ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              "Convert to Grayscale"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
