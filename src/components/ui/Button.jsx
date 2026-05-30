import './UI.css';

function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  className = '',
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...rest}>
      {Icon && <Icon className="btn__icon" />}
      {children && <span className="btn__label">{children}</span>}
    </button>
  );
}

export default Button;
