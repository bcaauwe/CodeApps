import { useEffect, useState } from 'react'
import { Button, makeStyles, tokens } from '@fluentui/react-components'
import { Dismiss20Regular, EditRegular, AddRegular, DeleteRegular } from '@fluentui/react-icons'
import type { Accounts } from '../generated/models/AccountsModel'
import type { Contacts } from '../generated/models/ContactsModel'
import { ContactsService } from '../generated/services/ContactsService'
import { ContactEditPane } from './ContactEditPane'
import { CreateContactPane } from './CreateContactPane'

const useStyles = makeStyles({
  paneOverlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'rgba(0, 0, 0, 0.4)',
    zIndex: '9999',
    opacity: 1,
    transition: 'opacity 0.2s ease',
  },
  pane: {
    position: 'fixed',
    top: '0',
    right: '0',
    bottom: '0',
    width: '420px',
    background: tokens.colorNeutralBackground1,
    boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.15)',
    zIndex: '10000',
    display: 'flex',
    flexDirection: 'column',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&.open': {
      transform: 'translateX(0)',
    },
  },
  paneHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
    flexShrink: 0,
  },
  paneTitle: {
    fontSize: '20px',
    fontWeight: 600,
    margin: '0',
    color: tokens.colorNeutralForeground1,
  },
  paneBody: {
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    gap: '16px',
    overflowY: 'auto',
    flex: 1,
  },
  addContactButton: {
    width: '100%',
  },
  contactsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  contactItem: {
    padding: '12px',
    border: `1px solid ${tokens.colorNeutralStroke3}`,
    borderRadius: '4px',
    background: tokens.colorNeutralBackground2,
    position: 'relative',
  },
  contactItemHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  contactName: {
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  editIconButton: {
    minWidth: 'auto',
    width: '24px',
    height: '24px',
    padding: '0',
    color: tokens.colorBrandForeground1,
  },
  deleteIconButton: {
    minWidth: 'auto',
    width: '24px',
    height: '24px',
    padding: '0',
    color: tokens.colorBrandForeground1,
  },
  contactEmail: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
    marginBottom: '2px',
    '& a': {
      color: tokens.colorBrandForeground1,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
  },
  contactPhone: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
    '& a': {
      color: tokens.colorBrandForeground1,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
  },
  emptyState: {
    padding: '24px',
    textAlign: 'center',
    color: tokens.colorNeutralForeground2,
    fontSize: '14px',
  },
  loadingState: {
    padding: '24px',
    textAlign: 'center',
    color: tokens.colorNeutralForeground2,
    fontSize: '14px',
  },
  dialogBackdrop: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    zIndex: '10001',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.5)',
  },
  dialogContent: {
    position: 'relative',
    zIndex: '10002',
    background: tokens.colorNeutralBackground1,
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    maxWidth: '400px',
    width: '90%',
    padding: '24px',
  },
})

interface AccountContactsPaneProps {
  account: Accounts | null
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function AccountContactsPane({
  account,
  isOpen,
  onOpenChange,
}: AccountContactsPaneProps) {
  const styles = useStyles()
  const [contacts, setContacts] = useState<Contacts[]>([])
  const [loading, setLoading] = useState(false)
  const [isEditPaneOpen, setIsEditPaneOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contacts | null>(null)
  const [isCreatePaneOpen, setIsCreatePaneOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<Contacts | null>(null)

  useEffect(() => {
    if (isOpen && account) {
      const fetchAccountContacts = async () => {
        try {
          setLoading(true)
          const result = await ContactsService.getAll({
            filter: `_accountid_value eq '${account.accountid}'`,
          })
          const contactsList = Array.isArray(result) ? result : (result as any)?.data || []

          setContacts(contactsList)
        } catch (err) {
          console.error('Error fetching contacts:', err)
          setContacts([])
        } finally {
          setLoading(false)
        }
      }

      fetchAccountContacts()
    }
  }, [account, isOpen])

  const handleEditContact = (contact: Contacts) => {
    setSelectedContact(contact)
    setIsEditPaneOpen(true)
  }

  const handleSaveContact = (updatedContact: Contacts) => {
    // Update the contact in the contacts array
    setContacts(
      contacts.map((contact) =>
        contact.contactid === updatedContact.contactid ? updatedContact : contact
      )
    )
    // In a real app, you'd call an API here to update the contact
    console.log('Saving contact:', updatedContact)
  }

  const handleCreateContact = (newContact: Contacts) => {
    // Add the new contact to the list
    setContacts([...contacts, newContact])
    console.log('Creating contact:', newContact)
  }

  const handleDeleteClick = (contact: Contacts) => {
    setContactToDelete(contact)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!contactToDelete) return

    try {
      await ContactsService.delete(contactToDelete.contactid)
      // Remove the contact from the list
      setContacts(contacts.filter((contact) => contact.contactid !== contactToDelete.contactid))
      console.log('Deleted contact:', contactToDelete.contactid)
    } catch (err) {
      console.error('Error deleting contact:', err)
    } finally {
      setIsDeleteDialogOpen(false)
      setContactToDelete(null)
    }
  }

  if (!account) {
    return null
  }

  return (
    <>
      <div
        className={styles.paneOverlay}
        onClick={() => onOpenChange(false)}
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
      />
      <div
        className={styles.pane}
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div className={styles.paneHeader}>
          <h2 className={styles.paneTitle}>{account.name} - Contacts</h2>
          <Button
            appearance="subtle"
            icon={<Dismiss20Regular />}
            onClick={() => onOpenChange(false)}
          />
        </div>

        <div className={styles.paneBody}>
          <Button
            appearance="primary"
            icon={<AddRegular />}
            onClick={() => setIsCreatePaneOpen(true)}
            className={styles.addContactButton}
          >
            Add Contact
          </Button>

          {loading ? (
            <div className={styles.loadingState}>Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className={styles.emptyState}>No contacts found for this account.</div>
          ) : (
            <div className={styles.contactsContainer}>
              {contacts.map((contact) => (
                <div key={contact.contactid} className={styles.contactItem}>
                  <div className={styles.contactItemHeader}>
                    <div className={styles.contactName}>
                      {contact.firstname && contact.lastname
                        ? `${contact.firstname} ${contact.lastname}`
                        : contact.firstname || contact.lastname || 'Unnamed Contact'}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <Button
                        appearance="subtle"
                        icon={<EditRegular />}
                        onClick={() => handleEditContact(contact)}
                        className={styles.editIconButton}
                      />
                      <Button
                        appearance="subtle"
                        icon={<DeleteRegular />}
                        onClick={() => handleDeleteClick(contact)}
                        className={styles.deleteIconButton}
                      />
                    </div>
                  </div>
                  {contact.emailaddress1 && (
                    <div className={styles.contactEmail}>
                      <a href={`mailto:${contact.emailaddress1}`}>{contact.emailaddress1}</a>
                    </div>
                  )}
                  {contact.telephone1 && (
                    <div className={styles.contactPhone}>
                      <a href={`tel:${contact.telephone1}`}>{contact.telephone1}</a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Edit Pane */}
      <ContactEditPane
        contact={selectedContact}
        isOpen={isEditPaneOpen}
        onOpenChange={setIsEditPaneOpen}
        onSave={handleSaveContact}
      />

      {/* Create Contact Pane */}
      <CreateContactPane
        account={account}
        isOpen={isCreatePaneOpen}
        onOpenChange={setIsCreatePaneOpen}
        onSave={handleCreateContact}
      />

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className={styles.dialogBackdrop} onClick={() => setIsDeleteDialogOpen(false)}>
          <div className={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', color: tokens.colorNeutralForeground1, fontSize: '16px', fontWeight: 600 }}>Delete Contact</h3>
            <p style={{ margin: '0 0 24px 0', color: tokens.colorNeutralForeground2, fontSize: '14px' }}>
              Are you sure you want to delete{' '}
              <strong>
                {contactToDelete?.firstname && contactToDelete?.lastname
                  ? `${contactToDelete.firstname} ${contactToDelete.lastname}`
                  : contactToDelete?.firstname || contactToDelete?.lastname || 'this contact'}
              </strong>
              ? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button appearance="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
