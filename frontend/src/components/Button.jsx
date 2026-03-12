import '../styles/Button.css'

export default function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    fullWidth && 'btn--full',
    disabled && 'btn--disabled',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}