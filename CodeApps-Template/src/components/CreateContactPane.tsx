import { useState, useEffect } from 'react'
import { Button, Input, Label, makeStyles, tokens } from '@fluentui/react-components'
import { Dismiss20Regular } from '@fluentui/react-icons'
import type { Accounts } from '../generated/models/AccountsModel'
import type { Contacts } from '../generated/models/ContactsModel'
import { ContactsService } from '../generated/services/ContactsService'

const useStyles = makeStyles({
  paneOverlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'rgba(0, 0, 0, 0.4)',
    zIndex: '10000',
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
    zIndex: '10001',
    display: 'flex',
    flexDirection: 'column',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
  formSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  fullWidthFormGroup: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  formInput: {
    fontSize: '14px',
  },
  paneFooter: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
    padding: '16px 24px',
    borderTop: `1px solid ${tokens.colorNeutralStroke3}`,
    flexShrink: 0,
    background: tokens.colorNeutralBackground1,
  },
  saveButton: {
    minWidth: '100px',
  },
  cancelButton: {
    minWidth: '100px',
  },
})

interface CreateContactPaneProps {
  account: Accounts | null
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (contact: Contacts) => void
}

export function CreateContactPane({
  account,
  isOpen,
  onOpenChange,
  onSave,
}: CreateContactPaneProps) {
  const styles = useStyles()
  const [formData, setFormData] = useState<Partial<Contacts>>({
    firstname: '',
    lastname: '',
    jobtitle: '',
    emailaddress1: '',
    telephone1: '',
    mobilephone: '',
  })

  useEffect(() => {
    if (isOpen) {
      // Reset form when opening
      setFormData({
        firstname: '',
        lastname: '',
        jobtitle: '',
        emailaddress1: '',
        telephone1: '',
        mobilephone: '',
      })
    }
  }, [isOpen])

  const handleInputChange = (field: keyof Contacts, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleSave = async () => {
    if (!account) return

    // Create the contact with the account ID reference
    const newContact: Omit<any, 'address1_addressid'> = {
      ...formData,
      lastname: formData.lastname || 'Unnamed', // lastname is required
      statecode: 0, // Active
      "parentcustomerid_account@odata.bind": `accounts(${account.accountid})`,
    }

    try {
        console.log('Creating contact:', newContact)
      const result = await ContactsService.create(newContact)
      const createdContact = (result as any).data || result
      onSave(createdContact)
      onOpenChange(false)
    } catch (err) {
      console.error('Error creating contact:', err)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
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
          <h2 className={styles.paneTitle}>New Contact</h2>
          <Button
            appearance="subtle"
            icon={<Dismiss20Regular />}
            onClick={() => onOpenChange(false)}
          />
        </div>

        <div className={styles.paneBody}>
          <div className={styles.formSection}>
            {/* Account - Display Only */}
            <div className={styles.fullWidthFormGroup}>
              <Label className={styles.formLabel}>Account</Label>
              <Input
                className={styles.formInput}
                type="text"
                value={account.name || ''}
                disabled
              />
            </div>

            {/* First Name */}
            <div className={styles.formGroup}>
              <Label className={styles.formLabel}>First Name</Label>
              <Input
                className={styles.formInput}
                type="text"
                value={formData.firstname || ''}
                onChange={(e) => handleInputChange('firstname', e.target.value)}
                placeholder="Enter first name"
              />
            </div>

            {/* Last Name */}
            <div className={styles.formGroup}>
              <Label className={styles.formLabel}>Last Name</Label>
              <Input
                className={styles.formInput}
                type="text"
                value={formData.lastname || ''}
                onChange={(e) => handleInputChange('lastname', e.target.value)}
                placeholder="Enter last name"
              />
            </div>

            {/* Job Title - Full Width */}
            <div className={styles.fullWidthFormGroup}>
              <Label className={styles.formLabel}>Job Title</Label>
              <Input
                className={styles.formInput}
                type="text"
                value={formData.jobtitle || ''}
                onChange={(e) => handleInputChange('jobtitle', e.target.value)}
                placeholder="Enter job title"
              />
            </div>

            {/* Email Address - Full Width */}
            <div className={styles.fullWidthFormGroup}>
              <Label className={styles.formLabel}>Email Address</Label>
              <Input
                className={styles.formInput}
                type="email"
                value={formData.emailaddress1 || ''}
                onChange={(e) => handleInputChange('emailaddress1', e.target.value)}
                placeholder="Enter email address"
              />
            </div>

            {/* Phone Number */}
            <div className={styles.formGroup}>
              <Label className={styles.formLabel}>Phone</Label>
              <Input
                className={styles.formInput}
                type="tel"
                value={formData.telephone1 || ''}
                onChange={(e) => handleInputChange('telephone1', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            {/* Mobile Phone */}
            <div className={styles.formGroup}>
              <Label className={styles.formLabel}>Mobile Phone</Label>
              <Input
                className={styles.formInput}
                type="tel"
                value={formData.mobilephone || ''}
                onChange={(e) => handleInputChange('mobilephone', e.target.value)}
                placeholder="Enter mobile phone"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.paneFooter}>
          <Button
            appearance="secondary"
            onClick={handleCancel}
            className={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button
            appearance="primary"
            onClick={handleSave}
            className={styles.saveButton}
          >
            Create
          </Button>
        </div>
      </div>
    </>
  )
}
