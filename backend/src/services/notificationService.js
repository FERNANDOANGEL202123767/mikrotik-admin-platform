class NotificationService {
  constructor() {
    this.notifications = [];
  }

  sendAlert(alert) {
    const notification = {
      ...alert,
      id: Date.now() + Math.random(),
      read: false,
      timestamp: new Date().toISOString(),
    };
    this.notifications.push(notification);
    if (this.notifications.length > 100) this.notifications.shift();
    return notification;
  }

  getNotifications(limit = 50) {
    return this.notifications.slice(-limit).reverse();
  }

  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) notification.read = true;
  }

  clearAll() {
    this.notifications = [];
  }
}

module.exports = new NotificationService();