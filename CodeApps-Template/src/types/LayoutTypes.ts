import type { ReactNode } from 'react'

export interface NavItem {
  path: string
  label: string
  description: string
  icon: React.ReactElement
  iconFilled: React.ReactElement
}

export interface LayoutProps {
  children: ReactNode
}

export interface ThemePickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}
