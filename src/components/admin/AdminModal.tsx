import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200">
      <div className="bg-[#121318] border border-[#1f212a] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              variant === 'danger'
                ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                : variant === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-[#FF0000]/10 border border-[#FF0000]/20 text-[#FF0000]'
            }`}
          >
            {variant === 'danger' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : variant === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-white">{title}</h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all cursor-pointer shadow-sm ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#FF0000] hover:bg-[#e60000]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const AdminToast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-[#121318] border border-[#1f212a] p-4 rounded-2xl shadow-2xl max-w-sm animate-in slide-in-from-bottom-2 duration-300">
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
          type === 'error'
            ? 'bg-red-500/10 text-red-400'
            : type === 'success'
            ? 'bg-emerald-500/10 text-emerald-400'
            : 'bg-[#FF0000]/10 text-[#FF0000]'
        }`}
      >
        {type === 'error' ? (
          <AlertTriangle className="w-4 h-4" />
        ) : (
          <CheckCircle className="w-4 h-4" />
        )}
      </div>
      <p className="text-xs sm:text-sm font-medium text-white flex-1">{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer p-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
