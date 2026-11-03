import { useEffect, useRef } from 'react';
import Icon from './Icon';
import './SharedUI.css';

/**
 * Kineticare Shared Component System
 * Clean, accessible, Notion-meets-rehabilitation clinical design.
 */

// 1. BUTTON
export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'pill'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      className={`kc-btn kc-btn-${variant} kc-btn-${size} ${loading ? 'kc-btn-loading' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="kc-spinner" aria-hidden="true" />
      ) : (
        icon && iconPosition === 'left' && <span className="kc-btn-icon">{icon}</span>
      )}
      <span className="kc-btn-text">{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="kc-btn-icon">{icon}</span>
      )}
    </button>
  );
}

// 2. INPUT FIELD
export function Input({
  label,
  id,
  error,
  helper,
  icon,
  clearable = false,
  value,
  onChange,
  className = '',
  ...props
}) {
  const inputId = id || (label ? `kc-input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  return (
    <div className={`kc-field-group ${error ? 'has-error' : ''} ${className}`}>
      {label && <label htmlFor={inputId} className="kc-label">{label}</label>}
      <div className="kc-input-wrapper">
        {icon && <span className="kc-input-icon-left">{icon}</span>}
        <input
          id={inputId}
          value={value}
          onChange={onChange}
          className={`kc-input ${icon ? 'with-icon-left' : ''} ${clearable && value ? 'with-icon-right' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
          {...props}
        />
        {clearable && value && (
          <button
            type="button"
            className="kc-input-clear"
            onClick={() => onChange && onChange({ target: { value: '' } })}
            aria-label="Clear text"
          >
            ×
          </button>
        )}
      </div>
      {error && <p id={`${inputId}-error`} className="kc-field-error" role="alert">{error}</p>}
      {!error && helper && <p id={`${inputId}-helper`} className="kc-field-helper">{helper}</p>}
    </div>
  );
}

// 3. TEXTAREA
export function Textarea({
  label,
  id,
  error,
  helper,
  rows = 3,
  className = '',
  ...props
}) {
  const inputId = id || (label ? `kc-textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  return (
    <div className={`kc-field-group ${error ? 'has-error' : ''} ${className}`}>
      {label && <label htmlFor={inputId} className="kc-label">{label}</label>}
      <textarea
        id={inputId}
        rows={rows}
        className="kc-textarea"
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && <p id={`${inputId}-error`} className="kc-field-error" role="alert">{error}</p>}
      {!error && helper && <p id={`${inputId}-helper`} className="kc-field-helper">{helper}</p>}
    </div>
  );
}

// 4. SELECT
export function Select({
  label,
  id,
  options = [],
  error,
  helper,
  className = '',
  ...props
}) {
  const inputId = id || (label ? `kc-select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  return (
    <div className={`kc-field-group ${error ? 'has-error' : ''} ${className}`}>
      {label && <label htmlFor={inputId} className="kc-label">{label}</label>}
      <div className="kc-select-wrapper">
        <select
          id={inputId}
          className="kc-select"
          aria-invalid={!!error}
          {...props}
        >
          {options.map(opt => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return <option key={val} value={val}>{lbl}</option>;
          })}
        </select>
        <span className="kc-select-chevron" aria-hidden="true">▾</span>
      </div>
      {error && <p className="kc-field-error" role="alert">{error}</p>}
      {!error && helper && <p className="kc-field-helper">{helper}</p>}
    </div>
  );
}

// 5. SEARCH INPUT
export function SearchInput({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search…',
  className = '',
  ...props
}) {
  return (
    <div className={`kc-search-wrapper ${className}`}>
      <span className="kc-search-icon" aria-hidden="true">
        <Icon name="search" size={16} />
      </span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="kc-search-input"
        {...props}
      />
      {value && (
        <button
          type="button"
          className="kc-search-clear"
          onClick={onClear || (() => onChange && onChange({ target: { value: '' } }))}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}

// 6. CARD
export function Card({
  title,
  subtitle,
  badge,
  actions,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  as: Component = 'div',
  onClick,
  interactive = false,
  ...props
}) {
  const isClickable = interactive || !!onClick;
  return (
    <Component
      className={`kc-card ${isClickable ? 'kc-card-interactive' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {(title || subtitle || badge || actions) && (
        <header className={`kc-card-header ${headerClassName}`}>
          <div className="kc-card-header-titles">
            {badge && <span className="kc-card-badge">{badge}</span>}
            {title && <h3 className="kc-card-title">{title}</h3>}
            {subtitle && <p className="kc-card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="kc-card-actions">{actions}</div>}
        </header>
      )}
      <div className={`kc-card-body ${bodyClassName}`}>{children}</div>
    </Component>
  );
}

// 7. BADGE / TAG
export function Badge({
  variant = 'default', // 'default' | 'ok' | 'warn' | 'bad' | 'teal' | 'draft' | 'approved' | 'simulated'
  size = 'md', // 'sm' | 'md'
  icon,
  children,
  className = '',
  ...props
}) {
  return (
    <span className={`kc-badge kc-badge-${variant} kc-badge-${size} ${className}`} {...props}>
      {icon && <span className="kc-badge-icon">{icon}</span>}
      <span className="kc-badge-text">{children}</span>
    </span>
  );
}

// 8. TABS
export function Tabs({
  tabs = [], // [{ id, label, icon, badge }]
  activeTab,
  onChange,
  className = '',
}) {
  return (
    <div className={`kc-tabs-container ${className}`} role="tablist">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`kc-tab-item ${isActive ? 'is-active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.icon && <span className="kc-tab-icon">{tab.icon}</span>}
            <span className="kc-tab-label">{tab.label}</span>
            {tab.badge != null && <span className="kc-tab-badge">{tab.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}

// 9. PROGRESS BAR
export function ProgressBar({
  value = 0,
  max = 100,
  showLabel = false,
  variant = 'teal', // 'teal' | 'ok' | 'warn' | 'bad'
  height = 8,
  className = '',
}) {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  return (
    <div className={`kc-progress-wrapper ${className}`}>
      {showLabel && (
        <div className="kc-progress-labels">
          <span className="kc-progress-value">{value} / {max}</span>
          <span className="kc-progress-percent">{percent}%</span>
        </div>
      )}
      <div
        className="kc-progress-track"
        style={{ height }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`kc-progress-fill kc-progress-fill-${variant}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// 10. LOADING SKELETON
export function Skeleton({
  variant = 'text', // 'text' | 'title' | 'avatar' | 'card' | 'rect'
  width,
  height,
  lines = 1,
  className = '',
}) {
  if (variant === 'text' && lines > 1) {
    return (
      <div className={`kc-skeleton-group ${className}`}>
        {Array.from({ length: lines }).map((_, idx) => (
          <div
            key={idx}
            className="kc-skeleton kc-skeleton-text"
            style={{ width: idx === lines - 1 ? '70%' : '100%', height }}
          />
        ))}
      </div>
    );
  }
  return (
    <div
      className={`kc-skeleton kc-skeleton-${variant} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

// 11. EMPTY STATE
export function EmptyState({
  icon,
  title,
  message,
  action,
  className = '',
}) {
  return (
    <div className={`kc-empty-state ${className}`}>
      <div className="kc-empty-icon">{icon || <Icon name="info" size={32} />}</div>
      {title && <h4 className="kc-empty-title">{title}</h4>}
      {message && <p className="kc-empty-message">{message}</p>}
      {action && <div className="kc-empty-action">{action}</div>}
    </div>
  );
}

// 12. ERROR STATE / ALERT
export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) {
  return (
    <div className={`kc-error-state ${className}`} role="alert">
      <div className="kc-error-header">
        <span className="kc-error-icon">!</span>
        <div>
          <h4 className="kc-error-title">{title}</h4>
          {message && <p className="kc-error-message">{message}</p>}
        </div>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="kc-error-retry">
          Retry
        </Button>
      )}
    </div>
  );
}

// 13. MODAL / DIALOG
export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 540,
  className = '',
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="kc-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`kc-modal-card ${className}`}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
        ref={dialogRef}
      >
        <header className="kc-modal-header">
          <div>
            {title && <h3 className="kc-modal-title">{title}</h3>}
            {subtitle && <p className="kc-modal-subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="kc-modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </header>
        <div className="kc-modal-body">{children}</div>
        {footer && <footer className="kc-modal-footer">{footer}</footer>}
      </div>
    </div>
  );
}

// 14. CONFIRM DIALOG
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth={440}
      footer={
        <div className="kc-confirm-actions">
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            size="md"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="kc-confirm-message">{message}</p>
    </Modal>
  );
}
