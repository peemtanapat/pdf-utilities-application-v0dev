import { FileUploader } from "@/components/file-uploader"
import { PDFOperations } from "@/components/pdf-operations"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex flex-col items-center space-y-6 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">PDF Utilities</h1>
        <p className="max-w-[700px] text-muted-foreground md:text-xl">
          Upload your PDF files and perform various operations like merging, unlocking, and converting to grayscale.
        </p>
      </div>

      <Tabs defaultValue="upload" className="mt-10">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="operations">PDF Operations</TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="p-4 border rounded-md mt-2">
          <FileUploader />
        </TabsContent>
        <TabsContent value="operations" className="p-4 border rounded-md mt-2">
          <PDFOperations />
        </TabsContent>
      </Tabs>
    </main>
  )
}
