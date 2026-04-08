// components/BadgeHex.jsx

// Rounded hexagon path using quadratic bezier curves at each corner (100x100 viewBox)
const HEX_PATH = "M43,3.6 Q50,0 57,3.6 L93,21.4 Q100,25 100,33 L100,67 Q100,75 93,78.6 L57,96.4 Q50,100 43,96.4 L7,78.6 Q0,75 0,67 L0,33 Q0,25 7,21.4 Z"

export default function BadgeHex({ level, unlocked, current }) {
  const classes = ['badge-hex', unlocked && 'badge-hex--unlocked', current && 'badge-hex--current']
    .filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <svg viewBox="-4 -4 108 108" className="badge-hex__svg" xmlns="http://www.w3.org/2000/svg">
        <path d={HEX_PATH} className="badge-hex__shape" />
      </svg>
      <div className="badge-hex__inner">
        <span className="badge-hex__label">Level {level} Badge</span>
      </div>
    </div>
  )
}
