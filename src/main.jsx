import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import './extra.css'
// Initialize Laravel Echo (Reverb WebSocket connection)
// Must be imported before App so window.Echo is available to useNotifications hook
import './echo-setup.js'

import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)
