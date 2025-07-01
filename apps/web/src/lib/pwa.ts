// PWA Service Worker Registration and Install Prompt

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, notify user
                  if (confirm('New version available! Reload to update?')) {
                    window.location.reload()
                  }
                }
              })
            }
          })
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    })
  }
}

// Install prompt handling
let deferredPrompt: any

export function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault()
    // Stash the event so it can be triggered later
    deferredPrompt = e
    
    // Show install button or banner
    showInstallPrompt()
  })

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed')
    hideInstallPrompt()
    deferredPrompt = null
  })
}

function showInstallPrompt() {
  // Create install prompt UI
  const installBanner = document.createElement('div')
  installBanner.id = 'install-banner'
  installBanner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <div>
        <div style="font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
          <img src="/logo-optimized.png" style="width: 24px; height: 24px; object-fit: contain;" alt="ChatNotes" />
          Install ChatNotes
        </div>
        <div style="font-size: 14px; opacity: 0.9;">Add to home screen for quick access</div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button id="install-button" style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
        ">Install</button>
        <button id="install-close" style="
          background: transparent;
          border: none;
          color: white;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          opacity: 0.7;
        ">✕</button>
      </div>
    </div>
  `
  
  document.body.appendChild(installBanner)
  
  // Handle install button click
  document.getElementById('install-button')?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`User response to the install prompt: ${outcome}`)
      deferredPrompt = null
      hideInstallPrompt()
    }
  })
  
  // Handle close button
  document.getElementById('install-close')?.addEventListener('click', () => {
    hideInstallPrompt()
  })
  
  // Auto-hide after 10 seconds
  setTimeout(hideInstallPrompt, 10000)
}

function hideInstallPrompt() {
  const installBanner = document.getElementById('install-banner')
  if (installBanner) {
    installBanner.remove()
  }
}

// Check if app is running in standalone mode (installed)
export function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true
}

// Setup offline indicator
export function setupOfflineIndicator() {
  const showOfflineMessage = () => {
    const offlineDiv = document.createElement('div')
    offlineDiv.id = 'offline-indicator'
    offlineDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #f59e0b;
        color: white;
        text-align: center;
        padding: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        📶 You're offline. Some features may be limited.
      </div>
    `
    document.body.appendChild(offlineDiv)
  }

  const hideOfflineMessage = () => {
    const offlineDiv = document.getElementById('offline-indicator')
    if (offlineDiv) {
      offlineDiv.remove()
    }
  }

  window.addEventListener('online', hideOfflineMessage)
  window.addEventListener('offline', showOfflineMessage)
  
  // Check initial state
  if (!navigator.onLine) {
    showOfflineMessage()
  }
}