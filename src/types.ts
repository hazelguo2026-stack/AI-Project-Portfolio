export interface Folder {
  id: string
  name: string
  icon: string
  color: string
  parentId: string | null
  order: number
}

export interface Note {
  id: string
  title: string
  content: string
  folderId: string | null
  tags: string[]
  createdAt: number
  updatedAt: number
  isPinned: boolean
}
