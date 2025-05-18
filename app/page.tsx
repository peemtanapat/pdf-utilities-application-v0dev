import { FileUploader } from "@/components/file-uploader"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex flex-col items-center space-y-6 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">PDF Merger</h1>
        <p className="max-w-[700px] text-muted-foreground md:text-xl">
          Upload multiple PDF files and merge them into a single document.
        </p>
      </div>

      <div className="mt-10 space-y-8">
        <div className="p-6 border rounded-md">
          <FileUploader />
        </div>
      </div>
    </main>
  )
}
