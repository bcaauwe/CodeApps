import { useState, useEffect, createContext } from 'react'
import type { ReactNode } from 'react'
import type { Theme } from '@fluentui/react-components'
import { webLightTheme, webDarkTheme } from '@fluentui/react-components'

export interface ThemeContextType {
  isDarkMode: boolean
  toggleTheme: () => void
  theme: Theme
  primaryColor: string
  setPrimaryColor: (color: string) => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

// Helper function to convert hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null
}

// Helper function to convert RGB to HSL
const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = (max + min) / 2
  let s = h
  let l = h

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

// Helper function to convert HSL to RGB
const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  h = h / 360
  s = s / 100
  l = l / 100
  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

// Helper function to convert RGB to hex
const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

const applyCustomTheme = (baseTheme: typeof webLightTheme, primaryColor: string) => {
  const customTheme = JSON.parse(JSON.stringify(baseTheme))
  
  // Extract RGB from hex color
  const rgb = hexToRgb(primaryColor)
  if (!rgb) return baseTheme

  // Convert to HSL for better color manipulation
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

  // Generate color variations
  const darker = hslToRgb(hsl.h, hsl.s, Math.max(hsl.l - 20, 5))

  // Apply primary color and its variations to theme
  customTheme.colorBrandBackground = primaryColor
  customTheme.colorBrandBackgroundHover = rgbToHex(darker.r, darker.g, darker.b)
  customTheme.colorBrandBackgroundSelected = rgbToHex(darker.r, darker.g, darker.b)
  customTheme.colorBrandBackgroundPressed = rgbToHex(darker.r, darker.g, darker.b)
  customTheme.colorBrandForeground1 = primaryColor
  customTheme.colorBrandStroke1 = primaryColor

  return customTheme
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Get initial theme from localStorage or default to light mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('codeApps-darkMode')
    return saved ? JSON.parse(saved) : false
  })

  const [primaryColor, setPrimaryColor] = useState(() => {
    const saved = localStorage.getItem('codeApps-primaryColor')
    return saved || '#0078D4' // Default Fluent UI blue
  })

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('codeApps-darkMode', JSON.stringify(isDarkMode))
  }, [isDarkMode])

  // Update localStorage when primary color changes
  useEffect(() => {
    localStorage.setItem('codeApps-primaryColor', primaryColor)
  }, [primaryColor])

  const toggleTheme = () => {
    setIsDarkMode((prev: boolean) => !prev)
  }

  const baseTheme = isDarkMode ? webDarkTheme : webLightTheme
  const theme = applyCustomTheme(baseTheme, primaryColor)

  const value = {
    isDarkMode,
    toggleTheme,
    theme,
    primaryColor,
    setPrimaryColor,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
