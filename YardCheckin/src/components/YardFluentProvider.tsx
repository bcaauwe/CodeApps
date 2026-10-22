import type { PropsWithChildren } from 'react'
import { FluentProvider, createLightTheme } from '@fluentui/react-components'

const yardTheme = createLightTheme({
  10: '#050000', 20: '#210405', 30: '#3b0709', 40: '#560a0d', 50: '#720d11',
  60: '#8f1116', 70: '#ad151b', 80: '#ca1920', 90: '#e21c24', 100: '#ed1c24',
  110: '#f4474d', 120: '#f96569', 130: '#fb8588', 140: '#fda7a9', 150: '#fecbcd', 160: '#fff0f0',
})

export function YardFluentProvider({ children }: PropsWithChildren) {
  return <FluentProvider theme={yardTheme} className="app-provider">{children}</FluentProvider>
}
