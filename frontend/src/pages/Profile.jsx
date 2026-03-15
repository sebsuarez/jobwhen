// pages/Profile.jsx
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import Button from '../components/Button'
import '../styles/Profile.css'

const stats = [
  { label: 'Total XP', value: '2100', className: 'profile-stat__value--xp' },
  { label: 'Applications', value: '10', className: 'profile-stat__value--applications' },
  { label: 'Badges Achieved', value: '6', className: 'profile-stat__value--badges' },
  { label: 'Challenges Completed', value: '7', className: 'profile-stat__value--challenges' },
  { label: 'Friends', value: '3', className: 'profile-stat__value--friends' },
  { label: 'Friends Encouraged', value: '13', className: 'profile-stat__value--encouraged' },
]

export default function Profile() {
  return (
    <div className="profile-page">
      <Sidebar />

      <main className="profile-page__main">
        <div className="profile-layout">
          <div className="profile-layout__left">
            <Card className="profile-card">
              <button className="profile-card__edit" type="button" aria-label="Edit profile">
                ✎
              </button>

              <div className="profile-card__avatar" />

              <h1 className="profile-card__name">User 1</h1>

              <div className="profile-card__details">
                <p>Software Engineering Student</p>
                <p>University of Calgary</p>
                <p>Calgary, AB, Canada</p>
              </div>
            </Card>

            <Card className="profile-bio">
              <h2 className="profile-section__title">Bio</h2>

              <div className="profile-bio__input-wrap">
                <input
                  type="text"
                  placeholder="e.g. Grinding Today!"
                  className="profile-bio__input"
                />
              </div>
            </Card>
          </div>

          <div className="profile-layout__right">
            <Card className="profile-level">
              <div className="profile-level__top">
                <h2 className="profile-level__title">Level 7</h2>
                <span className="profile-level__xp">XP 300/500</span>
              </div>

              <div className="profile-level__bar">
                <div className="profile-level__fill" />
              </div>
            </Card>

            <Card className="profile-stats">
              <h2 className="profile-section__title">Stats</h2>

              <div className="profile-stats__grid">
                {stats.map((stat) => (
                  <div key={stat.label} className="profile-stat">
                    <p className="profile-stat__label">{stat.label}</p>
                    <p className={`profile-stat__value ${stat.className}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}