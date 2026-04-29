import { useState, useEffect } from 'react'
import { makeStyles, shorthands, tokens } from '@fluentui/react-components'
import { PeopleFilled } from '@fluentui/react-icons'
import { AccountsService } from '../generated/services/AccountsService'
import type { Accounts } from '../generated/models/AccountsModel'
import { AccountsMap } from '../components/AccountsMap'
import { AccountEditModal } from '../components/AccountEditModal'
import { AccountContactsPane } from '../components/AccountContactsPane'
import '../styles/Customers.css'

const useStyles = makeStyles({
  container: {
    width: '100%',
    ...shorthands.margin('0', 'auto'),
    backgroundColor: tokens.colorNeutralBackground1,
  },
  headerIcon: {
    fontSize: '24px',
    color: tokens.colorBrandForeground1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
  },
})

export function Customers() {
  const styles = useStyles()
  const [accounts, setAccounts] = useState<Accounts[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Accounts | null>(null)
  const [isContactsPaneOpen, setIsContactsPaneOpen] = useState(false)
  const [selectedAccountForContacts, setSelectedAccountForContacts] = useState<Accounts | null>(null)

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true)
        const result = await AccountsService.getAll()
        if (Array.isArray(result)) {
          setAccounts(result)
        } else if (result && typeof result === 'object' && 'data' in result) {
          setAccounts((result as any).data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load accounts')
        console.error('Error fetching accounts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  // Handle edit account
  const handleEditAccount = (account: Accounts) => {
    setSelectedAccount(account)
    setIsModalOpen(true)
  }

  // Handle view contacts
  const handleViewContacts = (account: Accounts) => {
    setSelectedAccountForContacts(account)
    setIsContactsPaneOpen(true)
  }

  // Handle save account
  const handleSaveAccount = (updatedAccount: Accounts) => {
    // Here you would typically call an API to update the account
    console.log('Saving account:', updatedAccount)
    // Update the account in the accounts array
    setAccounts(
      accounts.map((acc) => (acc.accountid === updatedAccount.accountid ? updatedAccount : acc))
    )
    // In a real app, you'd call an API here
  }

  return (
    <div className="customers-container">
      <div className="customers-header-wrapper">
        <div className={styles.header}>
          <PeopleFilled className={styles.headerIcon} />
          <div>
            <h1 style={{ margin: '0 0 4px 0', fontSize: tokens.fontSizeBase500 }}>Customers</h1>
            <p style={{ margin: '0', fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground2 }}>Work with customer data</p>
          </div>
        </div>
      </div>
      
      {loading && <div className="loading">Loading accounts...</div>}
      {error && <div className="error">Error: {error}</div>}
      
      <div className="customers-layout">
        {/* Leaflet Map */}
        <div className="map-container">
          {loading ? (
            <div className="map-placeholder">
              <p>Loading map...</p>
            </div>
          ) : (
            <AccountsMap
              accounts={accounts}
              onEditAccount={handleEditAccount}
              onViewContacts={handleViewContacts}
            />
          )}
        </div>
      </div>

      {/* Account Edit Modal */}
      <AccountEditModal
        account={selectedAccount}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveAccount}
      />

      {/* Account Contacts Pane */}
      <AccountContactsPane
        account={selectedAccountForContacts}
        isOpen={isContactsPaneOpen}
        onOpenChange={setIsContactsPaneOpen}
      />
    </div>
  )
}
