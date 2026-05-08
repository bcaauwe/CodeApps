import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { Combobox, Option, makeStyles, tokens } from '@fluentui/react-components'
import { FilterRegular, DismissRegular } from '@fluentui/react-icons'
import type { Accounts } from '../generated/models/AccountsModel'
import type { Contacts } from '../generated/models/ContactsModel'
import { ContactsService } from '../generated/services/ContactsService'
import type { AccountsMapProps } from '../types/CustomerTypes'
import { useTheme } from '../hooks/useTheme'
import 'leaflet/dist/leaflet.css'
import '../styles/AccountsMap.css'

const useStyles = makeStyles({
  filterIcon: {
    fontSize: '20px',
    color: tokens.colorBrandForeground1,
    flexShrink: 0,
  },
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    height: '32px',
    padding: '0 8px',
    background: tokens.colorNeutralBackground3,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '4px',
    cursor: 'pointer',
    color: tokens.colorNeutralForeground1,
    fontSize: '13px',
    transition: 'all 0.2s ease',
    flexShrink: 0,
    ':hover': {
      background: tokens.colorNeutralBackground3Hover,
      color: tokens.colorBrandForeground1,
    },
    ':active': {
      background: tokens.colorNeutralBackground3Pressed,
    },
  },
})

// Fix leaflet marker icons
const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Create colored marker icons
const createColoredMarkerIcon = (color: string) => {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 0C9.37 0 4 5.37 4 12c0 8 12 28 12 28s12-20 12-28c0-6.63-5.37-12-12-12z" fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="16" cy="12" r="4" fill="white"/>
    </svg>
  `
  const svgUrl = `data:image/svg+xml,${encodeURIComponent(svgString)}`
  
  return L.icon({
    iconUrl: svgUrl,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  })
}

// Create icons for different revenue levels
const GreenIcon = createColoredMarkerIcon('#22c55e')
const OrangeIcon = createColoredMarkerIcon('#f97316')
const RedIcon = createColoredMarkerIcon('#ef4444')
const YellowIcon = createColoredMarkerIcon('#d4b01c')

// Determine marker color based on revenue
const getMarkerColorByRevenue = (revenue?: number) => {
  if (!revenue) return RedIcon
  if (revenue >= 100000000) return GreenIcon
  if (revenue >= 10000000) return OrangeIcon
  if (revenue >= 1000000) return YellowIcon
  return RedIcon
}

L.Marker.prototype.options.icon = DefaultIcon

export function AccountsMap({ accounts, onViewDetails }: AccountsMapProps) {
  const styles = useStyles()
  const { isDarkMode } = useTheme()
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const [contactsMap, setContactsMap] = useState<Map<string, Contacts>>()
  const [selectedState, setSelectedState] = useState<string>('')
  const [selectedRevenue, setSelectedRevenue] = useState<string>('')
  const accountsMapRef = useRef<Map<string, Accounts>>(new Map())

  // Revenue bucket definitions
  const revenueBuckets = [
    { label: 'All Revenue', value: '', min: 0, max: Infinity },
    { label: '≥ $100M', value: 'high', min: 100000000, max: Infinity },
    { label: '$10M - $100M', value: 'medium-high', min: 10000000, max: 99999999 },
    { label: '$1M - $10M', value: 'medium', min: 1000000, max: 9999999 },
    { label: '< $1M', value: 'low', min: 0, max: 999999 },
  ]

  // Check if account falls within selected revenue bucket
  const isAccountInRevenueBucket = (revenue: number | undefined): boolean => {
    if (!selectedRevenue) return true
    if (!revenue) return selectedRevenue === 'low'
    
    const bucket = revenueBuckets.find((b) => b.value === selectedRevenue)
    if (!bucket) return true
    return revenue >= bucket.min && revenue <= bucket.max
  }

  // Get display label for selected revenue
  const getRevenueDisplayLabel = (): string => {
    if (!selectedRevenue) return ''
    const bucket = revenueBuckets.find((b) => b.value === selectedRevenue)
    return bucket ? bucket.label : ''
  }

  // Get available states based on current revenue filter
  const getAvailableStates = (): string[] => {
    const filtered = accounts.filter(
      (account) =>
        account.address1_latitude &&
        account.address1_longitude &&
        account.address1_stateorprovince &&
        isAccountInRevenueBucket((account.revenue as any) || 0)
    )
    return Array.from(new Set(filtered.map((acc) => acc.address1_stateorprovince))).sort() as string[]
  }

  // Get available revenue buckets based on current state filter
  const getAvailableRevenueBuckets = (): typeof revenueBuckets => {
    const filtered = accounts.filter(
      (account) =>
        account.address1_latitude &&
        account.address1_longitude &&
        (!selectedState || account.address1_stateorprovince === selectedState)
    )

    return revenueBuckets.filter((bucket) => {
      if (bucket.value === '') return true // Always show "All Revenue"
      return filtered.some((account) => {
        const revenue = (account.revenue as any) || 0
        return revenue >= bucket.min && revenue <= bucket.max
      })
    })
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setSelectedState('')
    setSelectedRevenue('')
  }

  // Fetch contacts for all accounts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const result = await ContactsService.getAll()
        const contactsList = Array.isArray(result) ? result : (result as any)?.data || []

        // Create a map of contacts by contact ID (not account ID)
        const contactsByIdMap = new Map<string, Contacts>()
        contactsList.forEach((contact: Contacts) => {
          contactsByIdMap.set(contact.contactid, contact)
        })

        setContactsMap(contactsByIdMap)
      } catch (err) {
        console.error('Error fetching contacts:', err)
      }
    }

    fetchContacts()
  }, [])

  // Store accounts in a map for quick access
  useEffect(() => {
    accounts.forEach((account) => {
      accountsMapRef.current.set(account.accountid, account)
    })
  }, [accounts])

  // Swap tile layer when theme changes
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return

    const tileUrl = isDarkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    const tileAttribution = isDarkMode
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

    mapRef.current.removeLayer(tileLayerRef.current)
    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: tileAttribution,
      maxZoom: 19,
    }).addTo(mapRef.current)
  }, [isDarkMode])

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView([39.8283, -98.5795], 4)

      const tileUrl = isDarkMode
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      const tileAttribution = isDarkMode
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

      tileLayerRef.current = L.tileLayer(tileUrl, {
        attribution: tileAttribution,
        maxZoom: 19,
      }).addTo(mapRef.current)

      // Add legend control
      const legendHTML = `
        <div class="legend-content">
          <h4 class="legend-title">Revenue</h4>
          <div class="legend-item">
            <svg class="legend-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="25" viewBox="0 0 32 40">
              <path d="M16 0C9.37 0 4 5.37 4 12c0 8 12 28 12 28s12-20 12-28c0-6.63-5.37-12-12-12z" fill="#22c55e" stroke="white" stroke-width="1.5"/>
              <circle cx="16" cy="12" r="4" fill="white"/>
            </svg>
            <span class="legend-label">≥ $100M</span>
          </div>
          <div class="legend-item">
            <svg class="legend-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="25" viewBox="0 0 32 40">
              <path d="M16 0C9.37 0 4 5.37 4 12c0 8 12 28 12 28s12-20 12-28c0-6.63-5.37-12-12-12z" fill="#f97316" stroke="white" stroke-width="1.5"/>
              <circle cx="16" cy="12" r="4" fill="white"/>
            </svg>
            <span class="legend-label">$10M - $100M</span>
          </div>
          <div class="legend-item">
            <svg class="legend-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="25" viewBox="0 0 32 40">
              <path d="M16 0C9.37 0 4 5.37 4 12c0 8 12 28 12 28s12-20 12-28c0-6.63-5.37-12-12-12z" fill="#d4b01c" stroke="white" stroke-width="1.5"/>
              <circle cx="16" cy="12" r="4" fill="white"/>
            </svg>
            <span class="legend-label">$1M - $10M</span>
          </div>
          <div class="legend-item">
            <svg class="legend-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="25" viewBox="0 0 32 40">
              <path d="M16 0C9.37 0 4 5.37 4 12c0 8 12 28 12 28s12-20 12-28c0-6.63-5.37-12-12-12z" fill="#ef4444" stroke="white" stroke-width="1.5"/>
              <circle cx="16" cy="12" r="4" fill="white"/>
            </svg>
            <span class="legend-label">&lt; $1M</span>
          </div>
        </div>
      `
      
      const Legend = L.Control.extend({
        options: {
          position: 'bottomright',
        },
        onAdd: () => {
          const div = L.DomUtil.create('div', 'map-legend')
          div.innerHTML = legendHTML
          return div
        },
      })

      const legend = new Legend()
      legend.addTo(mapRef.current)
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      mapRef.current?.removeLayer(marker)
    })
    markersRef.current = []

    // Filter accounts with location and selected state
    let accountsToDisplay = accounts.filter(
      (account) => account.address1_latitude && account.address1_longitude
    )

    // If a state is selected, filter by that state
    if (selectedState) {
      accountsToDisplay = accountsToDisplay.filter(
        (account) => account.address1_stateorprovince === selectedState
      )
    }

    // Filter by revenue bucket
    accountsToDisplay = accountsToDisplay.filter((account) =>
      isAccountInRevenueBucket((account.revenue as any) || 0)
    )

    // Add markers for filtered accounts
    accountsToDisplay.forEach((account) => {
      if (mapRef.current && account.address1_latitude && account.address1_longitude) {
        const lat = Number(account.address1_latitude)
        const lng = Number(account.address1_longitude)
        
        // Get the marker icon color based on revenue
        const markerIcon = getMarkerColorByRevenue(account.revenue as any)
        
        const marker = L.marker([lat, lng], {
          icon: markerIcon,
        })

        // Open details modal on click
        marker.on('click', () => {
          if (onViewDetails) {
            onViewDetails(account)
          }
        })

        marker.addTo(mapRef.current)
        markersRef.current.push(marker)
      }
    })

    // Fit bounds if we have markers
    if (markersRef.current.length > 0 && mapRef.current) {
      const group = new L.FeatureGroup(markersRef.current)
      mapRef.current.fitBounds(group.getBounds().pad(0.1))
    }
  }, [accounts, contactsMap, selectedState, selectedRevenue])

  return (
    <div className="accounts-map-wrapper">
      <div className="map-filters-bar">
        <FilterRegular className={styles.filterIcon} />
        {(selectedState || selectedRevenue) && (
          <button
            onClick={handleClearFilters}
            className={styles.clearButton}
            title="Clear all filters"
          >
            <DismissRegular />
            Clear Filter
          </button>
        )}
        <div className="filter-item">
          <label className="filter-field-label">State</label>
          <Combobox
            value={selectedState}
            onOptionSelect={(_e: any, data: any) => setSelectedState(data?.optionValue || '')}
            placeholder="Select a state"
            className="filter-dropdown"
          >
            <Option text="All States" value="">
              All States
            </Option>
            {getAvailableStates().map((state: string) => (
              <Option key={state} text={state} value={state}>
                {state}
              </Option>
            ))}
          </Combobox>
        </div>
        <div className="filter-item">
          <label className="filter-field-label">Revenue</label>
          <Combobox
            value={getRevenueDisplayLabel()}
            onOptionSelect={(_e: any, data: any) => setSelectedRevenue(data?.optionValue || '')}
            placeholder="Select revenue range"
            className="filter-dropdown"
          >
            {getAvailableRevenueBuckets().map((bucket) => (
              <Option key={bucket.value} text={bucket.label} value={bucket.value}>
                {bucket.label}
              </Option>
            ))}
          </Combobox>
        </div>
      </div>
      <div ref={containerRef} className="map-container-root" />
    </div>
  )
}
