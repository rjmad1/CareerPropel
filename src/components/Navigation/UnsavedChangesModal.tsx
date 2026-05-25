'use client';

/**
 * UnsavedChangesModal — standard in-app confirmation dialog
 * shown when the user tries to navigate away with unsaved changes.
 *
 * Used by useUnsavedChangesGuard hook across resume editing,
 * STAR story editing, profile editing, and offer negotiation drafts.
 */

import { AlertTriangle } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, Button } from '@/components/ui';

interface UnsavedChangesModalProps {
  open: boolean;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function UnsavedChangesModal({
  open,
  message = 'You have unsaved changes. If you leave, your changes will be lost.',
  onConfirm,
  onCancel,
}: UnsavedChangesModalProps) {
  return (
    <Modal isOpen={open} onClose={onCancel} className="max-w-md w-11/12">
      <ModalHeader onClose={onCancel}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" aria-hidden="true" />
          <ModalTitle>Unsaved Changes</ModalTitle>
        </div>
      </ModalHeader>
      <ModalBody className="p-6">
        <p className="text-sm text-slate-700 leading-relaxed">{message}</p>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" size="sm" onClick={onCancel} autoFocus>
          Keep Editing
        </Button>
        <Button
          size="sm"
          className="bg-rose-600 hover:bg-rose-700 text-white border-rose-600"
          onClick={onConfirm}
        >
          Discard Changes
        </Button>
      </ModalFooter>
    </Modal>
  );
}
