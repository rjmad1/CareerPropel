[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / NotificationCenter

# Variable: NotificationCenter

> `const` **NotificationCenter**: `React.FC`

Defined in: [src/components/Notifications/NotificationCenter.tsx:29](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/components/Notifications/NotificationCenter.tsx#L29)

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
