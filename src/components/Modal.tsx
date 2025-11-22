import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      
      {/* 'modal-box' y puse estilos manuales */}
      <div className="relative bg-base-100 w-full max-w-lg shadow-2xl border border-base-300 rounded-2xl p-6">
        
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          ✕
        </button>
        
        <h3 className="font-bold text-lg mb-4 text-primary border-b pb-2">
          {title}
        </h3>
        
        <div>{children}</div>
      </div>
    </div>
  );
}