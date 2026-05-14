import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { AccountsProvider } from './contexts/AccountsContext'
import { WizardProvider } from './contexts/WizardContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AccountsProvider>
          <WizardProvider>
            <App />
          </WizardProvider>
        </AccountsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
