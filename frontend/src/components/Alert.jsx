import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;

  const config = {
    success: {
      bg: 'var(--success-light)',
      border: '#a7f3d0',
      color: 'var(--success-dark)',
      Icon: CheckCircle2
    },
    error: {
      bg: 'var(--danger-light)',
      border: '#fecaca',
      color: 'var(--danger-dark)',
      Icon: AlertCircle
    },
    warning: {
      bg: 'var(--warning-light)',
      border: '#fde68a',
      color: 'var(--warning-dark)',
      Icon: AlertCircle
    },
    info: {
      bg: 'var(--primary-light)',
      border: '#bfdbfe',
      color: 'var(--primary-dark)',
      Icon: Info
    }
  }[type] || {
    bg: 'var(--primary-light)',
    border: '#bfdbfe',
    color: 'var(--primary-dark)',
    Icon: Info
  };

  const { bg, border, color, Icon } = config;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: color,
        marginBottom: '1.25rem',
        fontSize: '0.9rem',
        fontWeight: 500,
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <Icon size={20} style={{ flexShrink: 0 }} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '2px'
          }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
