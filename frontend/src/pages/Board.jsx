// pages/Board.jsx
import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Button from '../components/Button'
import Modal from '../components/Modal'
import '../styles/Board.css'

const COLUMNS = [
  {id: 'wishlist', label: 'Wishlist' },
  {id: 'applied', label: 'Applied' },
  {id: 'interview', label: 'Interview' },
  {id: 'offer', label: 'Offer' },
  {id: 'rejected', label: 'Rejected' },
  {id: 'ghosted', label: 'Ghosted' },
]

export default function Board() {
  const [showAddModal, setShowAddModal] = useState(false)

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

        <div className="board__columns">
          {COLUMNS.map((col) => (
            <div key={col.id} className="board__column">
              <div className="board__column-header">
                <span className={`board__column-dot board__column-dot--${col.id}`} />
                <span className="board__column-label">{col.label}</span>
              </div>
              <div className="board__column-body">
                <p className="board__empty">No applications</p>
              </div>
            </div>
          ))}
        </div>
        
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