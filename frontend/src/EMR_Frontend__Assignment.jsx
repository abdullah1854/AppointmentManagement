/**
 * EMR Frontend Assignment - Appointment Management View
 *
 * This component implements the Appointment Scheduling and Queue Management feature.
 * All data operations go through the Python backend API (no frontend-only mutations).
 */

import { useState, useEffect } from 'react'

const API_BASE = 'http://localhost:8000'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function EMR_Frontend__Assignment() {
  // State
  const [appointments, setAppointments] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [activeTab, setActiveTab] = useState('today')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Today's date for comparisons
  const today = new Date().toISOString().split('T')[0]

  // =============================================================================
  // DATA FETCHING
  // =============================================================================

  const fetchAppointments = async (filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.date) params.append('date', filters.date)
      if (filters.status) params.append('status', filters.status)
      if (filters.doctorName) params.append('doctorName', filters.doctorName)

      const url = `${API_BASE}/appointments${params.toString() ? '?' + params : ''}`
      const response = await fetch(url)

      if (!response.ok) throw new Error('Failed to fetch appointments')

      const data = await response.json()
      setAppointments(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchAppointments()
  }, [])

  // =============================================================================
  // HANDLERS
  // =============================================================================

  // Calendar date click
  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    if (selectedDate === dateStr) {
      // Deselect and show all
      setSelectedDate(null)
      fetchAppointments()
    } else {
      setSelectedDate(dateStr)
      fetchAppointments({ date: dateStr })
    }
  }

  // Tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSelectedDate(null) // Clear date filter when switching tabs
    fetchAppointments() // Fetch all, then filter client-side by tab
  }

  // Status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || 'Failed to update status')
      }

      // Refresh list after successful update
      fetchAppointments(selectedDate ? { date: selectedDate } : {})
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  // Delete appointment
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return

    try {
      const response = await fetch(`${API_BASE}/appointments/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || 'Failed to delete')
      }

      fetchAppointments(selectedDate ? { date: selectedDate } : {})
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  // =============================================================================
  // FILTERING BY TAB
  // =============================================================================

  const getFilteredAppointments = () => {
    if (selectedDate) return appointments // Date filter takes precedence

    return appointments.filter(apt => {
      switch (activeTab) {
        case 'today':
          return apt.date === today
        case 'upcoming':
          return apt.date > today
        case 'past':
          return apt.date < today
        default:
          return true
      }
    })
  }

  const filteredAppointments = getFilteredAppointments()

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            + New Appointment
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Panel - Calendar */}
          <div className="w-80 flex-shrink-0">
            <Calendar
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              selectedDate={selectedDate}
              onDateClick={handleDateClick}
              appointments={appointments}
              today={today}
            />
          </div>

          {/* Right Panel - Appointments */}
          <div className="flex-1">
            {/* Tabs */}
            <Tabs activeTab={activeTab} onTabChange={handleTabChange} />

            {/* Status indicator */}
            {selectedDate && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Showing appointments for: <strong>{selectedDate}</strong>
                </span>
                <button
                  onClick={() => { setSelectedDate(null); fetchAppointments() }}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Clear filter
                </button>
              </div>
            )}

            {/* Content */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No appointments found
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map(apt => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    onStatusUpdate={handleStatusUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <CreateAppointmentForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false)
            fetchAppointments(selectedDate ? { date: selectedDate } : {})
          }}
        />
      )}
    </div>
  )
}

// =============================================================================
// CALENDAR COMPONENT
// =============================================================================

function Calendar({ currentMonth, setCurrentMonth, selectedDate, onDateClick, appointments, today }) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPadding = firstDay.getDay()

  const days = []

  // Padding for first week
  for (let i = 0; i < startPadding; i++) {
    days.push(null)
  }

  // Days of month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December']

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  // Get dates with appointments
  const appointmentDates = new Set(appointments.map(a => a.date))

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="font-semibold text-gray-900">
          {monthNames[month]} {year}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-xs text-gray-500 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, i) => {
          if (!date) return <div key={i} />

          const dateStr = date.toISOString().split('T')[0]
          const isToday = dateStr === today
          const isSelected = dateStr === selectedDate
          const hasAppointments = appointmentDates.has(dateStr)

          return (
            <button
              key={i}
              onClick={() => onDateClick(date)}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-lg text-sm
                transition-colors relative
                ${isSelected ? 'bg-blue-600 text-white' :
                  isToday ? 'bg-blue-100 text-blue-700 font-semibold' :
                  'hover:bg-gray-100'}
              `}
            >
              {date.getDate()}
              {hasAppointments && !isSelected && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// =============================================================================
// TABS COMPONENT
// =============================================================================

function Tabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'today', label: 'Today' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past', label: 'Past' }
  ]

  return (
    <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${activeTab === tab.id
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'}
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// =============================================================================
// APPOINTMENT CARD COMPONENT
// =============================================================================

function AppointmentCard({ appointment, onStatusUpdate, onDelete }) {
  const statusColors = {
    Confirmed: 'bg-green-100 text-green-800',
    Scheduled: 'bg-blue-100 text-blue-800',
    Cancelled: 'bg-red-100 text-red-800'
  }

  const modeIcons = {
    'In-Person': '🏥',
    'Video': '📹',
    'Phone': '📞'
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Time */}
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{appointment.time}</div>
          <div className="text-xs text-gray-500">{appointment.duration} min</div>
        </div>

        {/* Divider */}
        <div className="h-12 w-px bg-gray-200" />

        {/* Info */}
        <div>
          <div className="font-medium text-gray-900">{appointment.patientName}</div>
          <div className="text-sm text-gray-500">
            {appointment.doctorName} {modeIcons[appointment.mode] || ''}
          </div>
          <div className="text-xs text-gray-400">{appointment.date}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Status Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status] || 'bg-gray-100'}`}>
          {appointment.status}
        </span>

        {/* Status Actions */}
        {appointment.status !== 'Cancelled' && (
          <div className="flex gap-1">
            {appointment.status !== 'Confirmed' && (
              <button
                onClick={() => onStatusUpdate(appointment.id, 'Confirmed')}
                className="text-green-600 hover:bg-green-50 px-2 py-1 rounded text-xs"
              >
                Confirm
              </button>
            )}
            <button
              onClick={() => onStatusUpdate(appointment.id, 'Cancelled')}
              className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Delete */}
        <button
          onClick={() => onDelete(appointment.id)}
          className="text-gray-400 hover:text-red-500 p-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// =============================================================================
// CREATE APPOINTMENT FORM
// =============================================================================

function CreateAppointmentForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    patientName: '',
    date: '',
    time: '',
    duration: 30,
    doctorName: '',
    mode: 'In-Person'
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const doctors = ['Dr. Sarah Johnson', 'Dr. Michael Chen', 'Dr. James Williams']
  const modes = ['In-Person', 'Video', 'Phone']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || 'Failed to create appointment')
      }

      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">New Appointment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Name *
            </label>
            <input
              type="text"
              required
              value={formData.patientName}
              onChange={(e) => setFormData({...formData, patientName: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="John Smith"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Duration and Doctor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (min) *
              </label>
              <input
                type="number"
                required
                min="5"
                max="240"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor *
              </label>
              <select
                required
                value={formData.doctorName}
                onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select doctor</option>
                {doctors.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Mode *
            </label>
            <select
              required
              value={formData.mode}
              onChange={(e) => setFormData({...formData, mode: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {modes.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
