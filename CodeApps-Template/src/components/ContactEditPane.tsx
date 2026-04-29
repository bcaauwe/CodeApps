import { useState, useEffect } from 'react'
import { Button, Input, Label, makeStyles, tokens } from '@fluentui/react-components'
import { Dismiss20Regular } from '@fluentui/react-icons'
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

interface ContactEditPaneProps {
  contact: Contacts | null
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (contact: Contacts) => void
}

export function ContactEditPane({
  contact,
  isOpen,
  onOpenChange,
  onSave,
}: ContactEditPaneProps) {
  const styles = useStyles()
  const [formData, setFormData] = useState<Contacts | null>(null)

  // Update form data when contact changes
  useEffect(() => {
    if (contact) {
      setFormData({ ...contact })
    }
  }, [contact, isOpen])

  const handleInputChange = (field: keyof Contacts, value: string | number) => {
    if (formData) {
      setFormData({
        ...formData,
        [field]: value,
      })
    }
  }

  const handleSave = () => {
    if (formData) {
      onSave(formData)
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setFormData(contact)
    onOpenChange(false)
  }

  if (!contact || !formData) {
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
          <h2 className={styles.paneTitle}>Edit Contact</h2>
          <Button
            appearance="subtle"
            icon={<Dismiss20Regular />}
            onClick={() => onOpenChange(false)}
          />
        </div>

        <div className={styles.paneBody}>
          <div className={styles.formSection}>
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
            Save
          </Button>
        </div>
      </div>
    </>
  )
}
