import { create } from "zustand"

interface PDFStore {
  files: File[]
  addFiles: (newFiles: File[]) => void
  removeFile: (index: number) => void
  clearFiles: () => void
  reorderFiles: (fromIndex: number, toIndex: number) => void
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
  reorderFiles: (fromIndex, toIndex) =>
    set((state) => {
      const newFiles = [...state.files]
      const [movedFile] = newFiles.splice(fromIndex, 1)
      newFiles.splice(toIndex, 0, movedFile)
      return { files: newFiles }
    }),
}))
