import { useEffect, useState } from 'react'
import { Button, makeStyles, tokens, Spinner } from '@fluentui/react-components'
import { Dismiss20Regular, EditRegular, PeopleRegular, LocationRegular, CallRegular, GlobeRegular, MoneyRegular, PeopleTeamRegular, BotRegular } from '@fluentui/react-icons'
import { marked } from 'marked'
import type { Accounts } from '../generated/models/AccountsModel'
import type { Contacts } from '../generated/models/ContactsModel'
import { ContactsService } from '../generated/services/ContactsService'
import { AISummarizeRecordService } from '../generated/services/AISummarizeRecordService'

export interface AccountDetailsModalProps {
  account: Accounts | null
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onEditAccount?: (account: Accounts) => void
  onManageContacts?: (account: Accounts) => void
}

const useStyles = makeStyles({
  paneOverlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'rgba(0, 0, 0, 0.4)',
    zIndex: '9998',
    opacity: 1,
    transition: 'opacity 0.2s ease',
  },
  pane: {
    position: 'fixed',
    top: '0',
    right: '0',
    bottom: '0',
    width: '480px',
    background: tokens.colorNeutralBackground1,
    boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.15)',
    zIndex: '9999',
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
    gap: '20px',
    overflowY: 'auto',
    flex: 1,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  detailLabel: {
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    minWidth: '120px',
    flexShrink: 0,
  },
  detailValue: {
    color: tokens.colorNeutralForeground2,
    wordBreak: 'break-word',
  },
  link: {
    color: tokens.colorBrandForeground1,
    textDecoration: 'underline',
  },
  contactCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px',
    background: tokens.colorNeutralBackground3,
    borderRadius: '8px',
  },
  contactName: {
    fontWeight: 600,
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
  },
  contactDetail: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
  },
  summaryContainer: {
    padding: '12px',
    background: tokens.colorNeutralBackground3,
    borderRadius: '8px',
    fontSize: '14px',
    lineHeight: '1.6',
    color: tokens.colorNeutralForeground1,
    '& p': {
      margin: '8px 0',
      paddingLeft: '0',
    },
    '& ul': {
      marginLeft: '16px',
      paddingLeft: '0',
    },
    '& blockquote': {
      margin: '0',
      paddingLeft: '0',
      borderLeft: 'none',
    },
    '& div': {
      paddingLeft: '0',
    },
  },
  divider: {
    height: '1px',
    background: tokens.colorNeutralStroke3,
    margin: '4px 0',
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
})

export function AccountDetailsModal({ account, isOpen, onOpenChange, onEditAccount, onManageContacts }: AccountDetailsModalProps) {
  const styles = useStyles()
  const [primaryContact, setPrimaryContact] = useState<Contacts | null>(null)
  const [summary, setSummary] = useState<string>('')
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [loadingContact, setLoadingContact] = useState(false)

  useEffect(() => {
    if (!account || !isOpen) return

    // Fetch primary contact for this account
    const primaryContactId = (account as any)._primarycontactid_value
    if (primaryContactId) {
      setLoadingContact(true)
      ContactsService.getAll({
        filter: `contactid eq '${primaryContactId}'`,
      })
        .then((result) => {
          const list: Contacts[] = Array.isArray(result) ? result : (result as any)?.data || []
          setPrimaryContact(list.length > 0 ? list[0] : null)
        })
        .catch((err) => {
          console.error('Error fetching primary contact:', err)
          setPrimaryContact(null)
        })
        .finally(() => setLoadingContact(false))
    } else {
      setPrimaryContact(null)
    }

    // Fetch AI summary
    setLoadingSummary(true)
    setSummary('')
    ;(async () => {
      try {
        const contactsResult = await ContactsService.getAll({
          filter: `_accountid_value eq '${account.accountid}'`,
        })
        const contactsList: Contacts[] = Array.isArray(contactsResult) ? contactsResult : (contactsResult as any)?.data || []
        const accountContacts = contactsList.map((contact) => ({
          name: `${contact.firstname || ''} ${contact.lastname || ''}`.trim(),
          email: contact.emailaddress1 || '',
          phone: contact.telephone1 || '',
          jobTitle: contact.jobtitle || '',
        }))
        const recordContext = accountContacts.length > 0
          ? JSON.stringify({ relatedContacts: accountContacts })
          : undefined

        const result = await AISummarizeRecordService.AISummarizeRecord('account', account.accountid, true, recordContext)
        const data = result?.data as any
        const summaryText = data?.SummarizedText || data?.summary || 'No summary available.'
        setSummary(marked.parse(summaryText) as string)
      } catch (err) {
        setSummary('Failed to load summary.')
        console.error('Error fetching AI summary:', err)
      } finally {
        setLoadingSummary(false)
      }
    })()
  }, [account, isOpen])

  if (!account) return null

  const formatRevenue = (revenue: any) => {
    if (!revenue) return '—'
    return `$${(revenue / 1000000).toFixed(1)}M`
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
          <h2 className={styles.paneTitle}>{account.name}</h2>
          <Button
            appearance="subtle"
            icon={<Dismiss20Regular />}
            onClick={() => onOpenChange(false)}
          />
        </div>

        <div className={styles.paneBody}>
          {/* Company Info */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Company Information</div>
            {account.address1_line1 && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}><LocationRegular /> Address</span>
                <span className={styles.detailValue}>
                  {account.address1_line1}
                  {account.address1_city && `, ${account.address1_city}`}
                  {account.address1_stateorprovince && `, ${account.address1_stateorprovince}`}
                </span>
              </div>
            )}
            {account.telephone1 && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}><CallRegular /> Phone</span>
                <span className={styles.detailValue}>
                  <a href={`tel:${account.telephone1}`} className={styles.link}>{account.telephone1}</a>
                </span>
              </div>
            )}
            {account.websiteurl && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}><GlobeRegular /> Website</span>
                <span className={styles.detailValue}>
                  <a href={account.websiteurl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                    {account.websiteurl}
                  </a>
                </span>
              </div>
            )}
            {account.revenue && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}><MoneyRegular /> Revenue</span>
                <span className={styles.detailValue}>{formatRevenue(account.revenue)}</span>
              </div>
            )}
            {account.numberofemployees && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}><PeopleTeamRegular /> Employees</span>
                <span className={styles.detailValue}>{account.numberofemployees.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className={styles.divider} />

          {/* Primary Contact */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Primary Contact</div>
            {loadingContact ? (
              <Spinner size="small" label="Loading contact..." />
            ) : primaryContact ? (
              <div className={styles.contactCard}>
                <span className={styles.contactName}>
                  {primaryContact.firstname} {primaryContact.lastname}
                </span>
                {primaryContact.jobtitle && (
                  <span className={styles.contactDetail}>{primaryContact.jobtitle}</span>
                )}
                {primaryContact.emailaddress1 && (
                  <span className={styles.contactDetail}>
                    <a href={`mailto:${primaryContact.emailaddress1}`} className={styles.link}>
                      {primaryContact.emailaddress1}
                    </a>
                  </span>
                )}
                {primaryContact.telephone1 && (
                  <span className={styles.contactDetail}>{primaryContact.telephone1}</span>
                )}
              </div>
            ) : (
              <span className={styles.contactDetail}>No primary contact set.</span>
            )}
          </div>

          <div className={styles.divider} />

          {/* AI Summary */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}><BotRegular /> AI Summary</div>
            {loadingSummary ? (
              <Spinner size="small" label="Generating summary..." />
            ) : (
              <div
                className={styles.summaryContainer}
                dangerouslySetInnerHTML={{ __html: summary }}
              />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.paneFooter}>
          <Button
            appearance="secondary"
            icon={<PeopleRegular />}
            onClick={() => {
              onManageContacts?.(account)
            }}
          >
            Manage Contacts
          </Button>
          <Button
            appearance="primary"
            icon={<EditRegular />}
            onClick={() => {
              onEditAccount?.(account)
            }}
          >
            Edit Account
          </Button>
        </div>
      </div>
    </>
  )
}
