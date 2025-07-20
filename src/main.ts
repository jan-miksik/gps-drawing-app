import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import DesktopApp from './desktop.vue'

// Check if we're on desktop version
const isDesktop = window.location.pathname === '/desktop.html'

// Use the appropriate component
const ComponentToUse = isDesktop ? DesktopApp : App

createApp(ComponentToUse).mount('#app')
