"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { FileIcon, UploadIcon, XIcon } from "lucide-react"
import { usePDFStore } from "@/lib/pdf-store"

export function FileUploader() {
  const { toast } = useToast()
  const { addFiles, removeFile } = usePDFStore()
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Filter only PDF files
      const pdfFiles = acceptedFiles.filter((file) => file.type === "application/pdf")

      if (pdfFiles.length !== acceptedFiles.length) {
        toast({
          title: "Invalid file type",
          description: "Only PDF files are accepted",
          variant: "destructive",
        })
      }

      if (pdfFiles.length > 0) {
        // Simulate upload progress
        let progress = 0
        const interval = setInterval(() => {
          progress += 5
          setUploadProgress(progress)
          if (progress >= 100) {
            clearInterval(interval)
            addFiles(pdfFiles)
            setUploadProgress(0)
            toast({
              title: "Files uploaded",
              description: `${pdfFiles.length} file(s) uploaded successfully`,
            })
          }
        }, 100)
      }
    },
    [addFiles, toast],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
  })

  const { files } = usePDFStore()

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/20"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <UploadIcon className="h-12 w-12 text-muted-foreground" />
          <div>
            <p className="text-lg font-medium">
              {isDragActive ? "Drop the PDF files here" : "Drag & drop PDF files here"}
            </p>
            <p className="text-sm text-muted-foreground">or click to select files</p>
          </div>
        </div>
      </div>

      {uploadProgress > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uploading...</p>
          <Progress value={uploadProgress} />
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Uploaded Files ({files.length})</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {files.map((file, index) => (
              <Card key={index} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileIcon className="h-8 w-8 text-primary" />
                  <div className="truncate">
                    <p className="font-medium truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFile(index)} aria-label="Remove file">
                  <XIcon className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
