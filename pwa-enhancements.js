// PWA Enhancements
class PWAEnhancer {
  constructor() {
    this.isOnline = navigator.onLine;
    this.installPrompt = null;
    this.installButton = null;
    this.updateAvailable = false;
    
    this.init();
  }
  
  init() {
    this.setupInstallPrompt();
    this.setupOnlineStatus();
    this.setupUpdateNotifications();
    this.setupKeyboardShortcuts();
    this.setupFullscreenSupport();
    this.setupShareAPI();
    this.setupNotificationAPI();
  }
  
  // Install Prompt
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e;
      this.showInstallButton();
    });
    
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.hideInstallButton();
      this.showNotification('Приложение установлено!', 'success');
    });
  }
  
  showInstallButton() {
    if (this.installButton) return;
    
    this.installButton = document.createElement('button');
    this.installButton.innerHTML = '<i class="bi bi-download"></i> Установить приложение';
    this.installButton.className = 'btn btn-primary pwa-install-btn';
    this.installButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
      animation: slideInUp 0.3s ease-out;
    `;
    
    this.installButton.addEventListener('click', () => {
      this.installPrompt.prompt();
      this.installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        this.installPrompt = null;
        this.hideInstallButton();
      });
    });
    
    document.body.appendChild(this.installButton);
    
    // Auto-hide after 15 seconds
    setTimeout(() => {
      this.hideInstallButton();
    }, 15000);
  }
  
  hideInstallButton() {
    if (this.installButton) {
      this.installButton.style.animation = 'slideOutDown 0.3s ease-in';
      setTimeout(() => {
        if (this.installButton && this.installButton.parentNode) {
          this.installButton.remove();
          this.installButton = null;
        }
      }, 300);
    }
  }
  
  // Online Status
  setupOnlineStatus() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showNotification('Соединение восстановлено', 'success');
      this.updateOnlineStatus();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showNotification('Нет соединения с интернетом', 'warning');
      this.updateOnlineStatus();
    });
    
    this.updateOnlineStatus();
  }
  
  updateOnlineStatus() {
    const statusIndicator = document.querySelector('.online-status') || this.createStatusIndicator();
    statusIndicator.className = `online-status ${this.isOnline ? 'online' : 'offline'}`;
    statusIndicator.title = this.isOnline ? 'Онлайн' : 'Офлайн';
  }
  
  createStatusIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'online-status';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      z-index: 9999;
      transition: all 0.3s ease;
    `;
    document.body.appendChild(indicator);
    return indicator;
  }
  
  // Update Notifications
  setupUpdateNotifications() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          this.updateAvailable = true;
          this.showUpdateNotification();
        }
      });
    }
  }
  
  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="update-content">
        <i class="bi bi-arrow-clockwise"></i>
        <span>Доступно обновление</span>
        <button class="btn btn-sm btn-primary" onclick="this.parentElement.parentElement.remove(); window.location.reload();">
          Обновить
        </button>
      </div>
    `;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 1rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      animation: slideInDown 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutUp 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
      }
    }, 10000);
  }
  
  // Keyboard Shortcuts
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + S - Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveData();
      }
      
      // Ctrl/Cmd + O - Open
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        this.openFile();
      }
      
      // F11 - Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        this.toggleFullscreen();
      }
      
      // Escape - Close modals
      if (e.key === 'Escape') {
        this.closeModals();
      }
    });
  }
  
  saveData() {
    if (window._mindmap && window._mindmap.state.treeRoot) {
      const data = JSON.stringify(window._mindmap.state.treeRoot, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mindmap.json';
      a.click();
      URL.revokeObjectURL(url);
      this.showNotification('Данные сохранены', 'success');
    }
  }
  
  openFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.yaml,.yml';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            if (window._mindmap && window._mindmap.loadData) {
              window._mindmap.loadData(data);
              this.showNotification('Файл загружен', 'success');
            }
          } catch (error) {
            this.showNotification('Ошибка загрузки файла', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }
  
  // Fullscreen Support
  setupFullscreenSupport() {
    document.addEventListener('fullscreenchange', () => {
      this.updateFullscreenButton();
    });
    
    document.addEventListener('webkitfullscreenchange', () => {
      this.updateFullscreenButton();
    });
  }
  
  toggleFullscreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }
  
  updateFullscreenButton() {
    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
    const button = document.querySelector('[data-action="fullscreen"]');
    if (button) {
      const icon = button.querySelector('i');
      if (icon) {
        icon.className = isFullscreen ? 'bi bi-fullscreen-exit' : 'bi bi-fullscreen';
      }
    }
  }
  
  // Share API
  setupShareAPI() {
    if (navigator.share) {
      this.addShareButton();
    }
  }
  
  addShareButton() {
    const shareButton = document.createElement('button');
    shareButton.innerHTML = '<i class="bi bi-share"></i>';
    shareButton.className = 'btn btn-outline-primary';
    shareButton.title = 'Поделиться';
    shareButton.onclick = () => this.shareApp();
    
    // Add to toolbar if it exists
    const toolbar = document.querySelector('.toolbar');
    if (toolbar) {
      toolbar.appendChild(shareButton);
    }
  }
  
  async shareApp() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'JSON/YAML Mind Map Visualizer',
          text: 'Современный инструмент для визуализации данных',
          url: 'https://mind-map-visualizer.netlify.app/'
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    }
  }
  
  // Notification API
  setupNotificationAPI() {
    // Don't automatically request notification permission
    // It should be requested only in response to user action
    console.log('Notification API available:', 'Notification' in window);
  }
  
  async requestNotificationPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted');
      }
    } catch (error) {
      console.log('Notification permission denied');
    }
  }
  
  showNotification(message, type = 'info') {
    // Use existing toast system if available
    if (window._mindmap && window._mindmap.utils && window._mindmap.utils.showToast) {
      window._mindmap.utils.showToast(message, type);
      return;
    }
    
    // Fallback notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 1rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  closeModals() {
    const modals = document.querySelectorAll('.modal[style*="display: block"], .modal.show');
    modals.forEach(modal => {
      modal.style.display = 'none';
      modal.classList.remove('show');
    });
  }
}

// Initialize PWA Enhancer when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PWAEnhancer();
  });
} else {
  new PWAEnhancer();
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes slideOutDown {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(100%); opacity: 0; }
  }
  
  @keyframes slideInDown {
    from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  
  @keyframes slideOutUp {
    from { transform: translateX(-50%) translateY(0); opacity: 1; }
    to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
  }
  
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .online-status.online {
    background: #28a745;
    box-shadow: 0 0 10px rgba(40, 167, 69, 0.5);
  }
  
  .online-status.offline {
    background: #dc3545;
    box-shadow: 0 0 10px rgba(220, 53, 69, 0.5);
  }
  
  .pwa-install-btn {
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);
