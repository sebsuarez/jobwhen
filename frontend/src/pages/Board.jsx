// pages/Board.jsx
import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Card from '../components/Card'
import { fetchJobApplications, createJobApplication, updateJobApplicationStatus, updateJobApplication, deleteJobApplication } from '../api/boardQueries'
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

const EMPTY_FORM = {
  companyName: '',
  roleTitle: '',
  location: '',
  salaryRange: '',
  jobLink: '',
  status: 'wishlist',
  applicationDeadline: '',
  appliedDate: '',
  notes: '',
}

function formatDeadline(dateStr) {
  if (!dateStr) return null
  // Append time to avoid UTC offset shifting the date
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

export default function Board() {
  const { user } = useAuth()
  const location = useLocation()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(() => !!location.state?.openAddModal)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [draggedId, setDraggedId] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)
  const [selectedApp, setSelectedApp] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const boardColumnsRef = useRef(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchJobApplications(user.userId)
      .then(setApplications)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user])

  const getColumnJobs = (columnId) => {
    let jobs = applications.filter((app) => app.status === columnId)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      jobs = jobs.filter(
        (app) =>
          app.companyName.toLowerCase().includes(q) ||
          app.roleTitle.toLowerCase().includes(q) ||
          (app.location ?? '').toLowerCase().includes(q)
      )
    }
    return jobs
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const closeModal = () => {
    setShowAddModal(false)
    setForm(EMPTY_FORM)
  }

  const handleAddSubmit = async () => {
    if (!form.companyName.trim() || !form.roleTitle.trim()) return
    setSubmitting(true)
    try {
      const result = await createJobApplication({
        companyName: form.companyName,
        roleTitle: form.roleTitle,
        location: form.location || null,
        salaryRange: form.salaryRange || null,
        jobLink: form.jobLink || null,
        status: form.status || 'wishlist',
        applicationDeadline: form.applicationDeadline || null,
        appliedDate: form.appliedDate || null,
        notes: form.notes || null,
      })
      if (result.ok) {
        setApplications((prev) => [result.application, ...prev])
        closeModal()
      }
    } catch (err) {
      console.error('Failed to add application:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDragStart = (e, applicationId) => {
    setDraggedId(applicationId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('applicationId', String(applicationId))
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e, columnId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnId)
  }

  const handleDragLeave = (e) => {
    // Only clear if leaving the column entirely (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = async (e, newStatus) => {
    e.preventDefault()
    setDragOverColumn(null)
    const applicationId = Number(e.dataTransfer.getData('applicationId'))
    const app = applications.find((a) => a.applicationId === applicationId)
    if (!app || app.status === newStatus) return

    // Optimistic update
    setApplications((prev) =>
      prev.map((a) => a.applicationId === applicationId ? { ...a, status: newStatus } : a)
    )

    try {
      await updateJobApplicationStatus(applicationId, newStatus)
    } catch (err) {
      console.error('Failed to update status:', err)
      // Revert on failure
      setApplications((prev) =>
        prev.map((a) => a.applicationId === applicationId ? { ...a, status: app.status } : a)
      )
    }
  }

  const handleEditStart = () => {
    setEditForm({
      companyName: selectedApp.companyName,
      roleTitle: selectedApp.roleTitle,
      location: selectedApp.location ?? '',
      salaryRange: selectedApp.salaryRange ?? '',
      jobLink: selectedApp.jobLink ?? '',
      status: selectedApp.status,
      applicationDeadline: selectedApp.applicationDeadline ?? '',
      appliedDate: selectedApp.appliedDate ?? '',
      notes: selectedApp.notes ?? '',
    })
    setIsEditing(true)
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditForm(null)
  }

  const handleEditFormChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async () => {
    if (!editForm.companyName.trim() || !editForm.roleTitle.trim()) return
    setEditSubmitting(true)
    const original = selectedApp
    const updated = { ...selectedApp, ...editForm }
    // Optimistic update
    setApplications((prev) =>
      prev.map((a) => a.applicationId === selectedApp.applicationId ? updated : a)
    )
    setSelectedApp(updated)
    try {
      const result = await updateJobApplication(selectedApp.applicationId, {
        companyName: editForm.companyName,
        roleTitle: editForm.roleTitle,
        location: editForm.location || null,
        salaryRange: editForm.salaryRange || null,
        jobLink: editForm.jobLink || null,
        status: editForm.status,
        applicationDeadline: editForm.applicationDeadline || null,
        appliedDate: editForm.appliedDate || null,
        notes: editForm.notes || null,
      })
      if (result.ok) {
        setApplications((prev) =>
          prev.map((a) => a.applicationId === result.application.applicationId ? result.application : a)
        )
        setSelectedApp(result.application)
        setIsEditing(false)
        setEditForm(null)
      }
    } catch (err) {
      console.error('Failed to update application:', err)
      // Revert on failure
      setApplications((prev) =>
        prev.map((a) => a.applicationId === original.applicationId ? original : a)
      )
      setSelectedApp(original)
    } finally {
      setEditSubmitting(false)
    }
  }

  const handleDeleteApp = async () => {
   if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    const id = selectedApp.applicationId
    closeDetailModal()
    setConfirmDelete(false)
    setApplications((prev) => prev.filter((a) => a.applicationId !== id))
    try {
      await deleteJobApplication(id)
    } catch (err) {
      console.error('Failed to delete application:', err)
      // Re-fetch to restore state on failure
      fetchJobApplications(user.userId).then(setApplications)
    }
  }

  const closeDetailModal = () => {
    setSelectedApp(null)
    setIsEditing(false)
    setEditForm(null)
    setConfirmDelete(false)
  }

  // When a filter is active, show only that column
  const visibleColumns = activeFilter === 'All'
    ? COLUMNS
    : COLUMNS.filter((col) => col.id === activeFilter.toLowerCase())

    
const handleBoardDragOver = (e) => {
  const container = boardColumnsRef.current
  if (!container) return

  const rect = container.getBoundingClientRect()
  const horizontalEdge = 80
  const verticalTopEdge = 140
  const verticalBottomEdge = 140
  const scrollStep = 20

  if (e.clientX < rect.left + horizontalEdge) {
    container.scrollLeft -= scrollStep
  } else if (e.clientX > rect.right - horizontalEdge) {
    container.scrollLeft += scrollStep
  }

  if (e.clientY < verticalTopEdge) {
    window.scrollBy(0, -scrollStep)
  } else if (e.clientY > window.innerHeight - verticalBottomEdge) {
    window.scrollBy(0, scrollStep)
  }
}
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content board__page-scroll" onDragOver={handleBoardDragOver}>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
          <div className="board__columns"
               ref={boardColumnsRef}>
            {visibleColumns.map((col) => {
              const jobs = getColumnJobs(col.id)
              return (
                <div
                  key={col.id}
                  className={`board__column ${dragOverColumn === col.id ? 'board__column--drag-over' : ''}`}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
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
                        <Card
                          key={app.applicationId}
                          className={`board__job board__job--${app.status} ${draggedId === app.applicationId ? 'board__job--dragging' : ''}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, app.applicationId)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedApp(app)}
                        >
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
        
        <Modal isOpen={showAddModal} onClose={closeModal} title="Add New Application">
          <div className="board__form">
            <label className="board__form-label">Company *</label>
            <input
              name="companyName"
              type="text"
              placeholder="e.g. Google"
              value={form.companyName}
              onChange={handleFormChange}
            />
            <label className="board__form-label">Role *</label>
            <input
              name="roleTitle"
              type="text"
              placeholder="e.g. Frontend Developer"
              value={form.roleTitle}
              onChange={handleFormChange}
            />
            <label className="board__form-label">Location</label>
            <input
              name="location"
              type="text"
              placeholder="e.g. Calgary, AB"
              value={form.location}
              onChange={handleFormChange}
            />
            <label className="board__form-label">Salary Range</label>
            <input
              name="salaryRange"
              type="text"
              placeholder="e.g. $80k–$100k"
              value={form.salaryRange}
              onChange={handleFormChange}
            />
            <label className="board__form-label">Job Link</label>
            <input
              name="jobLink"
              type="url"
              placeholder="e.g. https://careers.google.com/..."
              value={form.jobLink}
              onChange={handleFormChange}
            />
            <label className="board__form-label">Status</label>
            <select name="status" value={form.status} onChange={handleFormChange}>
              {COLUMNS.map((col) => (
                <option key={col.id} value={col.id}>{col.label}</option>
              ))}
            </select>
            <label className="board__form-label">Application Deadline</label>
            <input
              name="applicationDeadline"
              type="date"
              value={form.applicationDeadline}
              onChange={handleFormChange}
            />
            <label className="board__form-label">Date Applied</label>
            <input
              name="appliedDate"
              type="date"
              value={form.appliedDate}
              onChange={handleFormChange}
            />
            <label className="board__form-label">Notes</label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Any notes..."
              value={form.notes}
              onChange={handleFormChange}
            />
            <div className="board__form-actions">
              <Button variant="ghost" onClick={closeModal}>Cancel</Button>
              <Button variant="submit" onClick={handleAddSubmit} disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Application'}
              </Button>
            </div>
          </div>
        </Modal>
        <Modal
          isOpen={!!selectedApp}
          onClose={closeDetailModal}
          title={
            isEditing
              ? 'Edit Application'
              : selectedApp ? `${selectedApp.companyName} — ${selectedApp.roleTitle}` : ''
          }
        >
          {selectedApp && !isEditing && (
            <div className="board__form">
              {selectedApp.location && (
                <>
                  <label className="board__form-label">Location</label>
                  <p>{selectedApp.location}</p>
                </>
              )}
              {selectedApp.salaryRange && (
                <>
                  <label className="board__form-label">Salary Range</label>
                  <p>{selectedApp.salaryRange}</p>
                </>
              )}
              {selectedApp.jobLink && (
                <>
                  <label className="board__form-label">Job Link</label>
                  <p><a href={selectedApp.jobLink} target="_blank" rel="noreferrer">{selectedApp.jobLink}</a></p>
                </>
              )}
              <label className="board__form-label">Status</label>
              <p style={{ textTransform: 'capitalize' }}>{selectedApp.status}</p>
              {selectedApp.applicationDeadline && (
                <>
                  <label className="board__form-label">Application Deadline</label>
                  <p>{formatDeadline(selectedApp.applicationDeadline)}</p>
                </>
              )}
              {selectedApp.appliedDate && (
                <>
                  <label className="board__form-label">Date Applied</label>
                  <p>{formatDeadline(selectedApp.appliedDate)}</p>
                </>
              )}
              {selectedApp.notes && (
                <>
                  <label className="board__form-label">Notes</label>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{selectedApp.notes}</p>
                </>
              )}
              <div className="board__form-actions">
                <Button variant="ghost" onClick={handleDeleteApp}>
                  {confirmDelete ? 'Confirm?' : 'Delete'}
                </Button>
                <Button variant="submit" onClick={handleEditStart}>Edit</Button>
              </div>
            </div>
          )}
          {selectedApp && isEditing && editForm && (
            <div className="board__form">
              <label className="board__form-label">Company *</label>
              <input
                name="companyName"
                type="text"
                value={editForm.companyName}
                onChange={handleEditFormChange}
              />
              <label className="board__form-label">Role *</label>
              <input
                name="roleTitle"
                type="text"
                value={editForm.roleTitle}
                onChange={handleEditFormChange}
              />
              <label className="board__form-label">Location</label>
              <input
                name="location"
                type="text"
                value={editForm.location}
                onChange={handleEditFormChange}
              />
              <label className="board__form-label">Salary Range</label>
              <input
                name="salaryRange"
                type="text"
                value={editForm.salaryRange}
                onChange={handleEditFormChange}
              />
              <label className="board__form-label">Job Link</label>
              <input
                name="jobLink"
                type="url"
                value={editForm.jobLink}
                onChange={handleEditFormChange}
              />
              <label className="board__form-label">Status</label>
              <select name="status" value={editForm.status} onChange={handleEditFormChange}>
              {COLUMNS.map((col) => (
                <option key={col.id} value={col.id}>{col.label}</option>
              ))}
              </select>
              <label className="board__form-label">Application Deadline</label>
              <input
                name="applicationDeadline"
                type="date"
                value={editForm.applicationDeadline}
                onChange={handleEditFormChange}
              />
              <label className="board__form-label">Date Applied</label>
              <input
                name="appliedDate"
                type="date"
                value={editForm.appliedDate}
                onChange={handleEditFormChange}
              />
              <label className="board__form-label">Notes</label>
              <textarea
                name="notes"
                rows={3}
                value={editForm.notes}
                onChange={handleEditFormChange}
              />
              <div className="board__form-actions">
                <Button variant="ghost" onClick={handleEditCancel}>Cancel</Button>
                <Button variant="submit" onClick={handleEditSubmit} disabled={editSubmitting}>
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  )
}