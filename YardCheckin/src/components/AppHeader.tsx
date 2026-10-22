import { useState } from 'react'
import { Badge, Button, Input } from '@fluentui/react-components'
import {
  CloudArrowUp24Regular, WeatherCloudy24Regular, WeatherRain24Regular, WeatherSnow24Regular,
  WeatherSunny24Regular, WeatherThunderstorm24Regular, WifiOff24Regular,
} from '@fluentui/react-icons'
import summitEquipmentLogo from '../assets/summit-equipment-logo.svg'

export type CurrentUser = { displayName: string; initials: string; photoUrl: string }
export type LocalWeather = { temperature: number; unit: string; condition: string; location: string }

type AppHeaderProps = {
  title: string
  isOnline: boolean
  currentUser: CurrentUser
  weather: LocalWeather | null
  weatherLocation: string
  weatherLoading: boolean
  weatherError: string
  onWeatherLocationChange: (location: string) => void
  onPhotoError: () => void
}

const getWeatherIcon = (condition: string) => {
  const value = condition.toLocaleLowerCase()
  if (/(thunder|storm|lightning)/.test(value)) return <WeatherThunderstorm24Regular />
  if (/(snow|sleet|ice|flurr)/.test(value)) return <WeatherSnow24Regular />
  if (/(rain|shower|drizzle)/.test(value)) return <WeatherRain24Regular />
  if (/(cloud|overcast|fog|haze|mist)/.test(value)) return <WeatherCloudy24Regular />
  return <WeatherSunny24Regular />
}

const getTemperatureUnit = (unit: string | undefined) => {
  const normalizedUnit = unit?.replace(/\uFFFD/g, '').trim().toUpperCase() || ''
  if (normalizedUnit.startsWith('F')) return 'F'
  if (normalizedUnit.startsWith('C')) return 'C'
  return normalizedUnit.replace(/^°\s*/, '')
}

export function AppHeader({
  title, isOnline, currentUser, weather, weatherLocation, weatherLoading, weatherError, onWeatherLocationChange, onPhotoError,
}: AppHeaderProps) {
  const [locationInput, setLocationInput] = useState(weatherLocation)
  const [weatherEditorOpen, setWeatherEditorOpen] = useState(false)
  const [loadedPhotoUrl, setLoadedPhotoUrl] = useState('')
  const photoLoaded = Boolean(currentUser.photoUrl) && loadedPhotoUrl === currentUser.photoUrl
  const temperatureUnit = getTemperatureUnit(weather?.unit)
  const weatherText = weatherLoading
    ? 'Weather…'
    : weather
      ? `${Math.round(weather.temperature)}°${temperatureUnit}`
    : weatherLocation ? 'Weather unavailable' : 'Set weather'
  const weatherIcon = weather ? getWeatherIcon(weather.condition) : <WeatherCloudy24Regular />

  const submitWeatherLocation = () => {
    if (!locationInput.trim()) return
    onWeatherLocationChange(locationInput)
    setWeatherEditorOpen(false)
  }

  return (
    <header className="topbar">
      <img className="brand-logo" src={summitEquipmentLogo} alt="Summit Equipment" />
      <div className="brand-context"><strong>{title}</strong><span>Yard operations</span></div>
      <div className="topbar-spacer" />
      <Badge appearance="tint" color={isOnline ? 'success' : 'warning'} icon={isOnline ? <CloudArrowUp24Regular /> : <WifiOff24Regular />}>
        {isOnline ? 'Online · Ready to sync' : 'Offline · Check-in unavailable'}
      </Badge>
      <div className="weather">
        <Button
          appearance="transparent"
          icon={weatherIcon}
          title={weather ? [weather.condition, weather.location].filter(Boolean).join(' · ') : weatherError}
          aria-expanded={weatherEditorOpen}
          aria-controls="weather-location-editor"
          onClick={() => setWeatherEditorOpen((open) => !open)}
        >
          {weatherText}
        </Button>
      </div>
      {weatherEditorOpen && (
        <div id="weather-location-editor" className="weather-editor" role="dialog" aria-label="Weather location">
          <strong>Weather location</strong>
          <p>Enter a city, postal code, or location name.</p>
          <Input
            value={locationInput}
            onChange={(_, data) => setLocationInput(data.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submitWeatherLocation()
              if (event.key === 'Escape') setWeatherEditorOpen(false)
            }}
            placeholder="e.g. Milwaukee, WI"
            aria-label="Weather location"
          />
          {weatherError && <small>{weatherError}</small>}
          <div className="weather-editor-actions">
            <Button appearance="subtle" onClick={() => setWeatherEditorOpen(false)}>Cancel</Button>
            <Button appearance="primary" disabled={!locationInput.trim()} onClick={submitWeatherLocation}>Update weather</Button>
          </div>
        </div>
      )}
      <div className={`avatar ${photoLoaded ? 'has-photo' : ''}`} title={currentUser.displayName} aria-label={`Signed in as ${currentUser.displayName}`}>
        <span className="avatar-initials" aria-hidden="true">{currentUser.initials}</span>
        {currentUser.photoUrl && (
          <img
            className="avatar-photo"
            src={currentUser.photoUrl}
            alt=""
            width={34}
            height={34}
            onLoad={() => setLoadedPhotoUrl(currentUser.photoUrl)}
            onError={() => {
              setLoadedPhotoUrl('')
              onPhotoError()
            }}
          />
        )}
      </div>
    </header>
  )
}
