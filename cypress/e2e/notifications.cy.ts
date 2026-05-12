/**
 * Notification System Tests
 * 
 * Tests notification features:
 * - Toast display and styling
 * - Auto-dismiss with progress bar
 * - Manual dismissal
 * - Notification types (info, success, warning, error)
 * - Action buttons
 * - Multiple concurrent notifications
 * - Notification manager API
 */

describe('Notification System', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  describe('Notification Display', () => {
    it('should display notification center container', () => {
      cy.get('[data-cy="notification-center"]').should('exist');
    });

    it('should show success notification', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.success('Operation Successful', 'Job applied successfully');
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Operation Successful').should('be.visible');
        cy.contains('Job applied successfully').should('be.visible');
        cy.contains('✅').should('be.visible');
      });
    });

    it('should show error notification', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.error('Operation Failed', 'Network error occurred');
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Operation Failed').should('be.visible');
        cy.contains('Network error occurred').should('be.visible');
        cy.contains('❌').should('be.visible');
      });
    });

    it('should show warning notification', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.warning('Warning', 'Resume may be missing important skills');
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Warning').should('be.visible');
        cy.contains('⚠️').should('be.visible');
      });
    });

    it('should show info notification', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.info('Information', 'New job matches available');
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Information').should('be.visible');
        cy.contains('ℹ️').should('be.visible');
      });
    });
  });

  describe('Notification Styling', () => {
    it('should apply correct colors to success notification', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.success('Success', 'Test message');
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.get('div[class*="bg-green-50"]').should('exist');
        cy.get('div[class*="border-green-200"]').should('exist');
      });
    });

    it('should apply correct colors to error notification', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.error('Error', 'Test message');
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.get('div[class*="bg-red-50"]').should('exist');
        cy.get('div[class*="border-red-200"]').should('exist');
      });
    });

    it('should apply correct colors to warning notification', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.warning('Warning', 'Test message');
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.get('div[class*="bg-yellow-50"]').should('exist');
        cy.get('div[class*="border-yellow-200"]').should('exist');
      });
    });

    it('should apply correct colors to info notification', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.info('Info', 'Test message');
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.get('div[class*="bg-blue-50"]').should('exist');
        cy.get('div[class*="border-blue-200"]').should('exist');
      });
    });
  });

  describe('Auto-dismiss', () => {
    it('should auto-dismiss success notification after 3 seconds', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.success('Success', 'Test message');
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Success').should('be.visible');
      });

      cy.wait(3500);

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Success').should('not.exist');
      });
    });

    it('should auto-dismiss error notification after 5 seconds', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.error('Error', 'Test message');
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Error').should('be.visible');
      });

      cy.wait(5500);

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Error').should('not.exist');
      });
    });

    it('should display progress bar during auto-dismiss', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.success('Success', 'Test message');
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Success').should('be.visible');
        // Progress bar should be visible
        cy.get('div[class*="bg-green-400"]').should('exist');
      });
    });

    it('should not auto-dismiss notification with duration 0', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.notify('info', 'Persistent', 'This stays forever', {
            duration: 0,
          });
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Persistent').should('be.visible');
      });

      cy.wait(5000);

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Persistent').should('still.be.visible');
      });
    });

    it('should respect custom duration', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.success('Quick Notification', 'Gone in 1 second', {
            duration: 1000,
          });
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Quick Notification').should('be.visible');
      });

      cy.wait(1500);

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Quick Notification').should('not.exist');
      });
    });
  });

  describe('Manual Dismissal', () => {
    it('should dismiss notification when close button clicked', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.success('Dismissible', 'Click the X to dismiss');
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Dismissible').should('be.visible');
        cy.contains('✕').click();
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Dismissible').should('not.exist');
      });
    });

    it('should animate out when dismissed', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.success('Animated', 'Watch it slide out');
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.get('[data-cy^="toast-"]').should(
          'have.class',
          'translate-x-0'
        );
        cy.contains('✕').click();
        cy.get('[data-cy^="toast-"]').should(
          'have.class',
          'translate-x-full'
        );
      });
    });
  });

  describe('Action Buttons', () => {
    it('should display action button when provided', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.notify('info', 'Undo Available', 'You can undo this action', {
            action: {
              label: 'Undo',
              onClick: () => console.log('Undoing...'),
            },
          });
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Undo').should('be.visible');
      });
    });

    it('should call action callback when action button clicked', () => {
      cy.window().then((win) => {
        win.actionClicked = false;
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.notify('info', 'Action Test', 'Test the action', {
            action: {
              label: 'Click Me',
              onClick: () => {
                win.actionClicked = true;
              },
            },
          });
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Click Me').click();
      });

      cy.window().then((win) => {
        expect(win.actionClicked).to.equal(true);
      });
    });

    it('should dismiss notification after action button clicked', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.notify('info', 'Action Test', 'Dismiss after action', {
            action: {
              label: 'Do Something',
              onClick: () => {},
            },
          });
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Action Test').should('be.visible');
        cy.contains('Do Something').click();
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Action Test').should('not.exist');
      });
    });
  });

  describe('Multiple Notifications', () => {
    it('should display multiple notifications simultaneously', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.success('Success 1', 'First notification');
          manager.error('Error 1', 'Second notification');
          manager.warning('Warning 1', 'Third notification');
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Success 1').should('be.visible');
        cy.contains('Error 1').should('be.visible');
        cy.contains('Warning 1').should('be.visible');
      });
    });

    it('should stack notifications vertically', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.success('First', 'Message 1');
          manager.success('Second', 'Message 2');
          manager.success('Third', 'Message 3');
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('First').should('be.visible');
        cy.contains('Second').should('be.visible');
        cy.contains('Third').should('be.visible');

        // Verify vertical spacing
        cy.get('div[class*="space-y-2"]').should('exist');
      });
    });

    it('should dismiss notifications independently', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.success('Notification 1', 'Message 1');
          manager.success('Notification 2', 'Message 2');
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Notification 1')
          .parent()
          .parent()
          .within(() => {
            cy.contains('✕').click();
          });
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Notification 1').should('not.exist');
        cy.contains('Notification 2').should('be.visible');
      });
    });
  });

  describe('Notification Manager API', () => {
    it('should provide notify method with all types', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        expect(manager).to.have.property('notify');
        expect(manager).to.have.property('success');
        expect(manager).to.have.property('error');
        expect(manager).to.have.property('warning');
        expect(manager).to.have.property('info');
      });
    });

    it('should return notification ID from notify', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          const id = manager.success('Test', 'Message');
          expect(id).to.be.a('string');
          expect(id.length).to.be.greaterThan(0);
        }
      });
    });

    it('should dismiss notification by ID', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          const id = manager.success('Dismissible', 'Test message');
          cy.wait(100).then(() => {
            manager.dismiss(id);
          });
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Dismissible').should('not.exist');
      });
    });

    it('should dismiss all notifications', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.success('Notification 1', 'Message 1');
          manager.success('Notification 2', 'Message 2');
          manager.success('Notification 3', 'Message 3');

          cy.wait(100).then(() => {
            manager.dismissAll();
          });
        }
      });

      cy.get('[data-cy="notification-center"]').within(() => {
        cy.contains('Notification 1').should('not.exist');
        cy.contains('Notification 2').should('not.exist');
        cy.contains('Notification 3').should('not.exist');
      });
    });

    it('should get all notifications', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.success('Test 1', 'Message 1');
          manager.success('Test 2', 'Message 2');

          const all = manager.getAll?.();
          expect(all).to.be.an('array');
          expect(all?.length).to.equal(2);
        }
      });
    });
  });

  describe('Positioning', () => {
    it('should be positioned at bottom-right of screen', () => {
      cy.window().then((win) => {
        const manager = win.getNotificationManager?.();
        if (manager) {
          manager.success('Positioned', 'Bottom right');
        }
      });

      cy.get('[data-cy="notification-center"]').should(
        'have.class',
        'fixed'
      );
      cy.get('[data-cy="notification-center"]').should(
        'have.class',
        'bottom-4'
      );
      cy.get('[data-cy="notification-center"]').should(
        'have.class',
        'right-4'
      );
    });

    it('should be above other content (high z-index)', () => {
      cy.get('[data-cy="notification-center"]').should('have.class', 'z-50');
    });
  });
});
