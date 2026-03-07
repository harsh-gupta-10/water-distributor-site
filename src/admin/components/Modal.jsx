import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, footer, wide }) {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className={`modal-panel ${wide ? 'modal-panel--wide' : ''}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-panel__header">
                    <h2 className="modal-panel__title">{title}</h2>
                    <button className="modal-panel__close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                <div className="modal-panel__body">{children}</div>
                {footer && <div className="modal-panel__footer">{footer}</div>}
            </div>
        </div>
    );
}
