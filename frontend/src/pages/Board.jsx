// pages/Board.jsx
import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Card from '../components/Card'
import { fetchJobApplications, createJobApplication, updateJobApplicationStatus } from '../api/boardQueries'
import { useAuth } from '../hooks/useAuth'
import '../styles/Board.css'

const COLUMNS = [
  {id: 'wishlist', label: 'Wishlist' },
  {id: 'applied', label: 'Applied' },
  {id: 'interview', label: 'Interview' },
  {id: 'offer', label: 'Offer' },
  {id: 'rejected', label: 'Rejected' },
  {id: 'ghosted', label: 'Ghosted' },
]

const FILTERS = ['All', 'Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted']

function formatDeadline(dateStr) {
  if (!dateStr) return null
  // Append time to avoid UTC offset shifting the date
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

export default function Board() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    if (!user) return
    fetchJobApplications(user.userId)
      .then(setApplications)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user])

  const getColumnJobs = (columnId) =>
    applications.filter((app) => app.status === columnId)

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        <div className="board__header">
          <div>
            <h1 className="page-title">Job Board</h1>
            <p className="page-subtitle">Drag cards between columns to update their status OR edit cards by clicking/tapping on them</p>
          </div>
          <div className="board__header-actions">
            <div className="board__search">
              <span className="board__search-icon">🔍</span>
              <input
                type="text"
                className="board__search-input"
                placeholder="Search..."
              />
            </div>
            <Button onClick={() => setShowAddModal(true)}>+ Add Job</Button>
          </div>
        </div>

        <div className="board__filters">
          {FILTERS.map((filter) => {
            const count = filter === 'All'
              ? applications.length
              : applications.filter((a) => a.status === filter.toLowerCase()).length
            return (
              <button
                key={filter}
                className={`board__filter ${activeFilter === filter ? 'board__filter--active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter} ({count})
              </button>
            )
          })}
        </div>

        {loading ? (
          <p className="board__empty">Loading applications...</p>
        ) : error ? (
          <p className="board__empty">Failed to load: {error}</p>
        ) : (
          <div className="board__columns">
            {COLUMNS.map((col) => {
              const jobs = getColumnJobs(col.id)
              return (
                <div key={col.id} className="board__column">
                  <div className="board__column-header">
                    <span className={`board__column-label board__column-label--${col.id}`}>
                      {col.label}
                    </span>
                    <span className="board__column-count">{jobs.length}</span>
                  </div>
                  <div className="board__column-body">
                    {jobs.length === 0 ? (
                      <p className="board__empty">No applications</p>
                    ) : (
                      jobs.map((app) => (
                        <Card key={app.applicationId} className={`board__job board__job--${app.status}`} onClick={() => {}}>
                          <h4 className="board__job-company">{app.companyName}</h4>
                          <p className="board__job-role">{app.roleTitle}</p>
                          {app.location && (
                            <p className="board__job-location">{app.location}</p>
                          )}
                          {app.salaryRange && (
                            <p className="board__job-salary">{app.salaryRange}</p>
                          )}
                          {app.applicationDeadline && (
                            <span className="board__job-deadline">
                              Deadline {formatDeadline(app.applicationDeadline)}
                            </span>
                          )}
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Application">
          <div className="board__form">
            <label className="board__form-label">Company</label>
            <input type="text" placeholder="e.g. Google" />
            <label className="board__form-label">Role</label>
            <input type="text" placeholder="e.g. Frontend Developer" />
            <label className="board__form-label">Location</label>
            <input type="text" placeholder="e.g. Calgary, AB" />
            <label className="board__form-label">Date Applied</label>
            <input type="date" />
            <label className="board__form-label">Notes</label>
            <textarea rows={3} placeholder="Any notes..." />
            <div className="board__form-actions">
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button variant="submit">Add Application</Button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  )
}