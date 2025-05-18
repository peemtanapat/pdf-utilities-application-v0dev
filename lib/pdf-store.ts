import { create } from "zustand"

interface PDFStore {
  files: File[]
  addFiles: (newFiles: File[]) => void
  removeFile: (index: number) => void
  clearFiles: () => void
}

export const usePDFStore = create<PDFStore>((set) => ({
  files: [],
  addFiles: (newFiles) =>
    set((state) => ({
      files: [...state.files, ...newFiles],
    })),
  removeFile: (index) =>
    set((state) => ({
      files: state.files.filter((_, i) => i !== index),
    })),
  clearFiles: () => set({ files: [] }),
}))
