class PWANotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null
  private permission: NotificationPermission = 'default'

  async init() {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported')
      return
    }

    if (!('Notification' in window)) {
      console.warn('Notifications are not supported')
      return
    }

    this.permission = await Notification.requestPermission()

    if (this.permission !== 'granted') {
      console.log('Notification permission not granted')
      return
    }
  }

  async showLowStockAlert(productName: string, currentStock: number, reorderPoint: number) {
    if (this.permission !== 'granted') return

    const notification = new Notification('Low Stock Alert', {
      body: `${productName} is running low! Current: ${currentStock} (Reorder at: ${reorderPoint})`,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: `low-stock-${productName}`,
      requireInteraction: false,
      silent: false,
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  }

  async showOutOfStockAlert(productName: string) {
    if (this.permission !== 'granted') return

    const notification = new Notification('Out of Stock', {
      body: `${productName} is completely out of stock! Please restock immediately.`,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: `out-of-stock-${productName}`,
      requireInteraction: true,
      silent: false,
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  }

  canShowNotifications(): boolean {
    return this.permission === 'granted'
  }
}

export const pwaNotificationService = new PWANotificationService()
