import type { Accounts } from '../generated/models/AccountsModel'
import type { Contacts } from '../generated/models/ContactsModel'

export interface AccountContactsPaneProps {
  account: Accounts | null
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export interface AccountEditModalProps {
  account: Accounts | null
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (account: Accounts) => void
}

export interface AccountsMapProps {
  accounts: Accounts[]
  onEditAccount: (account: Accounts) => void
  onViewContacts?: (account: Accounts) => void
}

export interface ContactEditPaneProps {
  contact: Contacts | null
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (contact: Contacts) => void
}

export interface CreateContactPaneProps {
  account: Accounts | null
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (contact: Contacts) => void
}
