[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / NotificationCenter

# Variable: NotificationCenter

> `const` **NotificationCenter**: `React.FC`

Defined in: [src/components/Notifications/NotificationCenter.tsx:29](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/components/Notifications/NotificationCenter.tsx#L29)

NotificationCenter - Manages and displays all toast notifications

Features:
- Centralized notification management
- Multiple concurrent notifications
- Stack management (FIFO dismissal)
- Auto-cleanup of dismissed notifications
- Type-specific styling
- Action button support

Usage:
- Place at root of app
- Use getNotificationManager() globally to show notifications

Example:
```
const notifier = getNotificationManager();
notifier.success('Success!', 'Operation completed');
notifier.error('Error!', 'Something went wrong', { duration: 5000 });
```
