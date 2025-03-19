
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { store } from './redux/store'
import { SessionPersistenceProvider } from './contexts/SessionPersistenceContext'

// Import i18n configuration
import './i18n'

// Get initial language from localStorage or browser
const initialLanguage = localStorage.getItem('i18nextLng') || navigator.language.split('-')[0];

// Set document language and direction
document.documentElement.lang = initialLanguage;
if (initialLanguage === 'ar') {
  document.documentElement.dir = 'rtl';
} else {
  document.documentElement.dir = 'ltr';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <SessionPersistenceProvider>
          <App />
        </SessionPersistenceProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
