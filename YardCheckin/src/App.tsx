import { useEffect, useState } from 'react'
import type { Msftmfm_returnbookings } from './generated/models/Msftmfm_returnbookingsModel'
import { AppHeader, type CurrentUser, type LocalWeather } from './components/AppHeader'
import { YardFluentProvider } from './components/YardFluentProvider'
import CheckInPage from './pages/CheckInPage'
import QueuePage from './pages/QueuePage'
import './App.css'

const QUEUE_ROUTE = '/queue'
const CHECK_IN_ROUTE = '/check-in'
const MOBILE_USER_AGENT = /Android|iPhone|iPad|iPod/i

const getInitials = (displayName: string, userPrincipalName = '') => {
  const nameParts = displayName.trim().split(/\s+/).filter(Boolean)
  if (nameParts.length > 1) return `${nameParts[0][0]}${nameParts.at(-1)?.[0] || ''}`.toUpperCase()
  if (nameParts.length === 1) return nameParts[0].slice(0, 2).toUpperCase()
  return userPrincipalName.split('@')[0].slice(0, 2).toUpperCase() || 'U'
}

const getPhotoMediaType = (base64: string) => {
  if (base64.startsWith('iVBORw0KGgo')) return 'image/png'
  if (base64.startsWith('/9j/')) return 'image/jpeg'
  if (base64.startsWith('R0lGOD')) return 'image/gif'
  if (base64.startsWith('UklGR')) return 'image/webp'
  return 'image/jpeg'
}

const loadImage = (source: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image()
  image.onload = () => resolve(image)
  image.onerror = () => reject(new Error('Profile photo could not be decoded.'))
  image.src = source
})

const getProfilePhotoUrl = async (photo: string) => {
  const value = photo.trim().replace(/^"|"$/g, '')
  if (!value) return ''
  if (/^https?:/i.test(value)) return value

  const dataUrlMatch = value.match(/^data:image\/[^;,]+;base64,(.+)$/i)
  const base64 = (dataUrlMatch?.[1] || value).replace(/\s/g, '')
  const image = await loadImage(`data:${getPhotoMediaType(base64)};base64,${base64}`)
  const canvas = document.createElement('canvas')
  const outputSize = 96
  canvas.width = outputSize
  canvas.height = outputSize
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Profile photo could not be resized.')

  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight)
  const sourceX = (image.naturalWidth - sourceSize) / 2
  const sourceY = (image.naturalHeight - sourceSize) / 2
  context.fillStyle = '#fff'
  context.fillRect(0, 0, outputSize, outputSize)
  context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, outputSize, outputSize)
  return canvas.toDataURL('image/jpeg', 0.9)
}

function App() {
  const [route, setRoute] = useState(QUEUE_ROUTE)
  const [selectedBooking, setSelectedBooking] = useState<Msftmfm_returnbookings | null>(null)
  const [completedBookingIds, setCompletedBookingIds] = useState<string[]>([])
  const [queueRefreshKey, setQueueRefreshKey] = useState(0)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [currentUser, setCurrentUser] = useState<CurrentUser>({ displayName: 'Dana Scott', initials: 'DS', photoUrl: '' })
  const [weatherLocation, setWeatherLocation] = useState('')
  const [weather, setWeather] = useState<LocalWeather | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState('Enter a location to show local weather.')
  const [weatherRefreshKey, setWeatherRefreshKey] = useState(0)

  useEffect(() => {
    const updateConnection = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', updateConnection)
    window.addEventListener('offline', updateConnection)
    return () => {
      window.removeEventListener('online', updateConnection)
      window.removeEventListener('offline', updateConnection)
    }
  }, [])

  useEffect(() => {
    if (!weatherLocation) return
    let cancelled = false

    const loadWeather = async () => {
      try {
        const { MSNWeatherService } = await import('./generated/services/MSNWeatherService')
        const result = await MSNWeatherService.CurrentWeather(weatherLocation, 'I')
        if (cancelled) return
        const current = result.success ? result.data?.responses?.weather?.current : undefined
        if (!current || typeof current.temp !== 'number') {
          setWeatherError('Local weather could not be loaded from MSN Weather.')
          return
        }
        setWeather({
          temperature: current.temp,
          unit: result.data?.units?.temperature || 'F',
          condition: current.cap || current.wx || current.sky || 'Current weather',
          location: result.data?.responses?.source?.location || 'Device location',
        })
      } catch {
        if (!cancelled) setWeatherError('Local weather could not be loaded from MSN Weather.')
      } finally {
        if (!cancelled) setWeatherLoading(false)
      }
    }

    void loadWeather()

    return () => { cancelled = true }
  }, [weatherLocation, weatherRefreshKey])

  useEffect(() => {
    let cancelled = false
    const loadCurrentUser = async () => {
      try {
        const { Office365UsersService } = await import('./generated/services/Office365UsersService')
        const profileResult = await Office365UsersService.MyProfile_V2('id,displayName,userPrincipalName')
        if (!profileResult.success || !profileResult.data || cancelled) return
        const profile = profileResult.data
        const displayName = profile.displayName || profile.userPrincipalName || 'Current user'
        setCurrentUser({ displayName, initials: getInitials(displayName, profile.userPrincipalName), photoUrl: '' })
        if (MOBILE_USER_AGENT.test(navigator.userAgent)) return

        const userId = profile.id || profile.userPrincipalName
        if (!userId) return
        const photoResult = await Office365UsersService.UserPhoto_V2(userId)
        if (!photoResult.success || !photoResult.data || cancelled) return
        const photoUrl = await getProfilePhotoUrl(photoResult.data)
        if (photoUrl && !cancelled) setCurrentUser((user) => ({ ...user, photoUrl }))
      } catch (error) {
        console.warn('The current user profile photo could not be loaded.', error)
        // The initials remain visible when the connector or profile photo is unavailable.
      }
    }
    void loadCurrentUser()
    return () => { cancelled = true }
  }, [])

  const navigate = (nextRoute: string) => {
    setRoute(nextRoute)
  }

  const updateWeatherLocation = (location: string) => {
    const value = location.trim()
    if (!value) {
      setWeatherError('Enter a city, postal code, or location name.')
      return
    }
    setWeather(null)
    setWeatherError('')
    setWeatherLoading(true)
    setWeatherLocation(value)
    setWeatherRefreshKey((key) => key + 1)
  }

  const startCheckIn = (booking: Msftmfm_returnbookings | null) => {
    setSelectedBooking(booking)
    navigate(CHECK_IN_ROUTE)
  }

  const returnToQueue = (completedBookingId?: string) => {
    if (completedBookingId) {
      setCompletedBookingIds((ids) => ids.includes(completedBookingId) ? ids : [...ids, completedBookingId])
    }
    setSelectedBooking(null)
    setQueueRefreshKey((key) => key + 1)
    navigate(QUEUE_ROUTE)
  }

  return (
    <YardFluentProvider>
      <div className="app-shell">
        <AppHeader
          title={route === QUEUE_ROUTE ? 'Yard Return Queue' : 'Return Check-In'}
          isOnline={isOnline}
          currentUser={currentUser}
          weather={weather}
          weatherLocation={weatherLocation}
          weatherLoading={weatherLoading}
          weatherError={weatherError}
          onWeatherLocationChange={updateWeatherLocation}
          onPhotoError={() => setCurrentUser((user) => ({ ...user, photoUrl: '' }))}
        />
        {route === QUEUE_ROUTE
          ? <QueuePage completedBookingIds={completedBookingIds} refreshKey={queueRefreshKey} onStartCheckIn={startCheckIn} />
          : <CheckInPage booking={selectedBooking} currentUser={currentUser} isOnline={isOnline} onCancel={() => returnToQueue()} onComplete={returnToQueue} />}
      </div>
    </YardFluentProvider>
  )
}

export default App
