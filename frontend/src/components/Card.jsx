// components/Modal.jsx
import '../styles/Card.css'

export default function Card({ children, className = '', onClick, ...props }) {
  return (
    <div
      className={`card ${onClick ? 'card--clickable' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}