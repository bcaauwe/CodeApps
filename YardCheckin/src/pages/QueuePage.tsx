import { useEffect, useState } from 'react'
import { Badge, Button, Card, Spinner } from '@fluentui/react-components'
import { ArrowRight24Regular, CheckmarkCircle24Filled, Search24Regular, Warning24Filled } from '@fluentui/react-icons'
import type { Msftmfm_returnbookings } from '../generated/models/Msftmfm_returnbookingsModel'

type BookingWithRentalDetails = Msftmfm_returnbookings & {
  rentalAgreementNumber?: string
  customerAccountName?: string
  rentalAgreementDetailsError?: boolean
  customerAccountLinked?: boolean
  customerAccountDetailsError?: boolean
}

type QueuePageProps = {
  completedBookingIds: string[]
  refreshKey: number
  onStartCheckIn: (booking: Msftmfm_returnbookings | null) => void
}

const formatReturnSlot = (value?: string) => {
  if (!value) return 'Return time not scheduled'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString([], {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export default function QueuePage({ completedBookingIds, refreshKey, onStartCheckIn }: QueuePageProps) {
  const [returnBookings, setReturnBookings] = useState<BookingWithRentalDetails[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [bookingsError, setBookingsError] = useState('')
  const [localRefreshKey, setLocalRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const loadReturnBookings = async () => {
      setBookingsLoading(true)
      setBookingsError('')
      try {
        const [
          { Msftmfm_returnbookingsService },
          { Msftmfm_rentalagreementsService },
          { AccountsService },
        ] = await Promise.all([
          import('../generated/services/Msftmfm_returnbookingsService'),
          import('../generated/services/Msftmfm_rentalagreementsService'),
          import('../generated/services/AccountsService'),
        ])
        const result = await Msftmfm_returnbookingsService.getAll({
          filter: 'statecode eq 0 and (msftmfm_status eq 100000000 or msftmfm_status eq 100000001)',
          orderBy: ['msftmfm_requestedreturnslot asc'],
          maxPageSize: 100,
        })
        if (cancelled) return
        if (!result.success || !result.data) {
          setBookingsError('Outstanding return bookings could not be loaded. Try refreshing the queue.')
          return
        }
        const bookingsWithRentalDetails = await Promise.all(result.data.map(async (booking) => {
          const rentalAgreementId = booking._msftmfm_rentalagreementid_value
          if (!rentalAgreementId) return booking

          try {
            const rentalAgreementResult = await Msftmfm_rentalagreementsService.get(rentalAgreementId)
            if (!rentalAgreementResult.success || !rentalAgreementResult.data) {
              console.error(
                `Rental agreement details could not be loaded for booking ${booking.msftmfm_bookingreference}.`,
                rentalAgreementResult.error,
              )
              return { ...booking, rentalAgreementDetailsError: true }
            }
            const rentalAgreement = rentalAgreementResult.data
            const accountId = rentalAgreement._msftmfm_customeraccountid_value
            if (!accountId) {
              return {
                ...booking,
                rentalAgreementNumber: rentalAgreement.msftmfm_agreementnumber,
                customerAccountLinked: false,
              }
            }

            const accountResult = await AccountsService.get(accountId, { select: ['name'] })
            if (!accountResult.success || !accountResult.data) {
              console.error(
                `Customer account details could not be loaded for rental agreement ${rentalAgreement.msftmfm_agreementnumber}.`,
                accountResult.error,
              )
              return {
                ...booking,
                rentalAgreementNumber: rentalAgreement.msftmfm_agreementnumber,
                customerAccountLinked: true,
                customerAccountDetailsError: true,
              }
            }
            return {
              ...booking,
              rentalAgreementNumber: rentalAgreement.msftmfm_agreementnumber,
              customerAccountLinked: true,
              customerAccountName: accountResult.data.name,
            }
          } catch (error) {
            console.error(
              `Rental agreement details could not be loaded for booking ${booking.msftmfm_bookingreference}.`,
              error,
            )
            return { ...booking, rentalAgreementDetailsError: true }
          }
        }))
        if (!cancelled) setReturnBookings(bookingsWithRentalDetails)
      } catch {
        if (!cancelled) setBookingsError('Outstanding return bookings could not be loaded. Check the connection and try again.')
      } finally {
        if (!cancelled) setBookingsLoading(false)
      }
    }
    void loadReturnBookings()
    return () => { cancelled = true }
  }, [refreshKey, localRefreshKey])

  const outstandingBookings = returnBookings.filter(
    (booking) => !completedBookingIds.includes(booking.msftmfm_returnbookingid),
  )
  const refresh = () => setLocalRefreshKey((key) => key + 1)

  return (
    <main className="bookings-page">
      <section className="bookings-hero">
        <div>
          <p className="eyebrow">YARD CHECK-IN</p>
          <h1>Outstanding returns</h1>
          <p>Select a pending or confirmed return booking to begin the equipment check-in.</p>
        </div>
        <div className="bookings-summary">
          <strong>{bookingsLoading ? '—' : outstandingBookings.length}</strong>
          <span>waiting for check-in</span>
        </div>
      </section>
      <section className="bookings-content" aria-live="polite">
        <div className="bookings-toolbar">
          <div><h2>Return booking queue</h2><p>Sorted by requested return time</p></div>
          <Button appearance="secondary" icon={<Search24Regular />} disabled={bookingsLoading} onClick={refresh}>Refresh queue</Button>
        </div>
        {bookingsLoading && <div className="bookings-state"><Spinner size="large" /><strong>Loading outstanding returns…</strong></div>}
        {!bookingsLoading && bookingsError && <div className="bookings-state error-state"><Warning24Filled /><strong>{bookingsError}</strong><Button appearance="primary" onClick={refresh}>Try again</Button></div>}
        {!bookingsLoading && !bookingsError && outstandingBookings.length === 0 && <div className="bookings-state"><CheckmarkCircle24Filled /><strong>All caught up</strong><p>There are no pending or confirmed return bookings.</p><Button appearance="secondary" onClick={refresh}>Refresh queue</Button></div>}
        {!bookingsLoading && !bookingsError && outstandingBookings.length > 0 && (
          <div className="booking-list">
            {outstandingBookings.map((booking) => (
              <Card className="booking-card" key={booking.msftmfm_returnbookingid}>
                <div className="booking-status"><Badge color={booking.msftmfm_status === 100000001 ? 'success' : 'warning'}>{booking.msftmfm_statusname || (booking.msftmfm_status === 100000001 ? 'Confirmed' : 'Pending')}</Badge></div>
                <div className="booking-primary">
                  <span>BOOKING</span>
                  <h3>{booking.msftmfm_bookingreference}</h3>
                  <p>
                    {booking.customerAccountName
                      ? `Account: ${booking.customerAccountName}`
                      : !booking._msftmfm_rentalagreementid_value
                        ? 'No rental agreement linked'
                        : booking.rentalAgreementDetailsError
                          ? 'Rental agreement unavailable'
                          : booking.customerAccountLinked === false
                            ? 'No customer account linked to rental agreement'
                            : booking.customerAccountDetailsError
                              ? 'Customer account details could not be loaded'
                              : 'Customer account unavailable'}
                  </p>
                  {booking._msftmfm_rentalagreementid_value && (
                    <small>
                      {booking.rentalAgreementNumber
                        ? `Rental agreement: ${booking.rentalAgreementNumber}`
                        : booking.rentalAgreementDetailsError
                          ? 'Rental agreement details could not be loaded'
                          : 'Rental agreement number unavailable'}
                    </small>
                  )}
                </div>
                <div className="booking-slot"><span>REQUESTED RETURN</span><strong>{formatReturnSlot(booking.msftmfm_requestedreturnslot)}</strong></div>
                <Button appearance="primary" size="large" icon={<ArrowRight24Regular />} iconPosition="after" onClick={() => onStartCheckIn(booking)}>Start check-in</Button>
              </Card>
            ))}
          </div>
        )}
        <div className="unplanned-return">
          <div><strong>Equipment arrived without a booking?</strong><span>Start the existing scan-first check-in process.</span></div>
          <Button appearance="subtle" onClick={() => onStartCheckIn(null)}>Start unplanned check-in</Button>
        </div>
      </section>
    </main>
  )
}
