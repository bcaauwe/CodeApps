import { useState, useEffect } from 'react'
import { Button, Input, Label, makeStyles, tokens } from '@fluentui/react-components'
import { Dismiss20Regular } from '@fluentui/react-icons'
import type { Accounts } from '../generated/models/AccountsModel'

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
    '&.hidden': {
      opacity: 0,
      pointerEvents: 'none',
    },
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
  paneFooter: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
    padding: '16px 24px',
    borderTop: `1px solid ${tokens.colorNeutralStroke3}`,
    flexShrink: 0,
    background: tokens.colorNeutralBackground1,
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
  saveButton: {
    minWidth: '100px',
  },
  cancelButton: {
    minWidth: '100px',
  },
})

interface AccountEditModalProps {
  account: Accounts | null
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (account: Accounts) => void
}

export function AccountEditModal({
  account,
  isOpen,
  onOpenChange,
  onSave,
}: AccountEditModalProps) {
  const styles = useStyles()
  const [formData, setFormData] = useState<Accounts | null>(null)

  // Update form data when account changes
  useEffect(() => {
    if (account) {
      setFormData({ ...account })
    }
  }, [account, isOpen])

  const handleInputChange = (field: keyof Accounts, value: string | number) => {
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
    setFormData(account)
    onOpenChange(false)
  }

  if (!account || !formData) {
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
          <h2 className={styles.paneTitle}>Edit Customer</h2>
          <Button
            appearance="subtle"
            icon={<Dismiss20Regular />}
            onClick={() => onOpenChange(false)}
          />
        </div>

        <div className={styles.paneBody}>
          <div className={styles.formSection}>
            {/* Account Name - Full Width */}
            <div className={styles.fullWidthFormGroup}>
              <Label className={styles.formLabel}>Account Name</Label>
              <Input
                className={styles.formInput}
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter account name"
              />
            </div>

            {/* Address Line 1 - Full Width */}
            <div className={styles.fullWidthFormGroup}>
              <Label className={styles.formLabel}>Address Line 1</Label>
              <Input
                className={styles.formInput}
                type="text"
                value={formData.address1_line1 || ''}
                onChange={(e) => handleInputChange('address1_line1', e.target.value)}
                placeholder="Enter street address"
              />
            </div>

            {/* City */}
            <div className={styles.formGroup}>
              <Label className={styles.formLabel}>City</Label>
              <Input
                className={styles.formInput}
                type="text"
                value={formData.address1_city || ''}
                onChange={(e) => handleInputChange('address1_city', e.target.value)}
                placeholder="Enter city"
              />
            </div>

            {/* State/Province */}
            <div className={styles.formGroup}>
              <Label className={styles.formLabel}>State/Province</Label>
              <Input
                className={styles.formInput}
                type="text"
                value={formData.address1_stateorprovince || ''}
                onChange={(e) => handleInputChange('address1_stateorprovince', e.target.value)}
                placeholder="Enter state or province"
              />
            </div>

            {/* Website URL - Full Width */}
            <div className={styles.fullWidthFormGroup}>
              <Label className={styles.formLabel}>Website URL</Label>
              <Input
                className={styles.formInput}
                type="url"
                value={formData.websiteurl || ''}
                onChange={(e) => handleInputChange('websiteurl', e.target.value)}
                placeholder="Enter website URL"
              />
            </div>

            {/* Phone Number */}
            <div className={styles.formGroup}>
              <Label className={styles.formLabel}>Phone Number</Label>
              <Input
                className={styles.formInput}
                type="tel"
                value={formData.telephone1 || ''}
                onChange={(e) => handleInputChange('telephone1', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            {/* Revenue */}
            <div className={styles.formGroup}>
              <Label className={styles.formLabel}>Revenue</Label>
              <Input
                className={styles.formInput}
                type="number"
                value={formData.revenue ? (formData.revenue as any).toString() : ''}
                onChange={(e) =>
                  handleInputChange('revenue', e.target.value ? parseFloat(e.target.value) : '')
                }
                placeholder="Enter revenue amount"
              />
            </div>

            {/* Number of Employees */}
            <div className={styles.formGroup}>
              <Label className={styles.formLabel}>Number of Employees</Label>
              <Input
                className={styles.formInput}
                type="number"
                value={formData.numberofemployees ? (formData.numberofemployees as any).toString() : ''}
                onChange={(e) =>
                  handleInputChange(
                    'numberofemployees',
                    e.target.value ? parseInt(e.target.value, 10) : ''
                  )
                }
                placeholder="Enter number of employees"
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
