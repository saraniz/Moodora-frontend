import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

/** A window that opens on top of the page. */
export function Modal({ title, onClose, children, className }: ModalProps) {
  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay">
          <Dialog.Content
            className={cn("window modal", className)}
            aria-describedby={undefined}
          >
            <div className="window-bar">
              <span className="window-dots" aria-hidden>
                <i />
                <i />
                <i />
              </span>
              <Dialog.Title className="window-title">{title}</Dialog.Title>
              <span className="window-actions">
                <Dialog.Close className="icon-btn" aria-label="Close">
                  <X size={15} />
                </Dialog.Close>
              </span>
            </div>
            <div className="window-body">{children}</div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <Modal title={title} onClose={onClose} className="modal--small">
      <p className="muted">{message}</p>
      <div className="row row--end">
        <button className="btn" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn btn--danger"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
