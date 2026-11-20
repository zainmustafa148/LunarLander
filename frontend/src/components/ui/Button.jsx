import clsx from 'clsx'
import styles from './Button.module.css'

/*
 * Text button with an optional Lucide icon.
 * variant: 'primary' | 'secondary' | 'ghost'     size: 'md' | 'sm'
 * Pass `pressed` (true/false) to make it a toggle button; it is announced with aria-pressed.
 * `loading` disables the button and shows a spinner. For icon-only buttons use IconButton.
 */
export default function Button({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  loading = false,
  pressed,
  disabled,
  type = 'button',
  className,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={clsx(styles.button, styles[variant], styles[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-pressed={pressed}
      {...props}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : Icon && <Icon size={16} aria-hidden="true" />}
      {children}
    </button>
  )
}
