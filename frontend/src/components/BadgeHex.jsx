// components/BadgeHex.jsx

export default function BadgeHex({ level, unlocked, current }) {
  return (
    <div
      className={[
        'badge-hex',
        unlocked ? 'badge-hex--unlocked' : '',
        current ? 'badge-hex--current' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="badge-hex__inner">
        <span className="badge-hex__label">Level {level} Badge</span>
      </div>
    </div>
  )
}
