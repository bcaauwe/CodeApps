import { FluentProvider } from '@fluentui/react-components'
import { HashRouter } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import App from '../App'

export const ThemedApp = () => {
  const { theme } = useTheme()
  
  return (
    <FluentProvider theme={theme}>
      <HashRouter>
        <App />
      </HashRouter>
    </FluentProvider>
  )
}
