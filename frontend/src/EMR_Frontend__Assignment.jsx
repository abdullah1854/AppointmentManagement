/**
 * EMR Frontend Assignment - Appointment Management View
 * Redesigned to match Reference 1 (Dashboard) and Reference 2 (Calendar)
 */

import { useState, useEffect } from 'react'

const API_BASE = 'http://localhost:8000'

// =============================================================================
// ICONS (SVG Components)
// =============================================================================

const Icons = {
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  List: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Document: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Link: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  X: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  MoreVertical: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  ),
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function EMR_Frontend__Assignment() {
  const [currentView, setCurrentView] = useState('dashboard') // dashboard | calendar
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showPatientForm, setShowPatientForm] = useState(false)
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const today = new Date().toISOString().split('T')[0]

  // Fetch appointments
  const fetchAppointments = async (filters = {}) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.date) params.append('date', filters.date)
      const url = `${API_BASE}/appointments${params.toString() ? '?' + params : ''}`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setAppointments(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  // Status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!response.ok) throw new Error('Failed to update')
      fetchAppointments()
    } catch (err) {
      alert(err.message)
    }
  }

  // Delete
  const handleDelete = async (id) => {
    if (!confirm('Delete this appointment?')) return
    try {
      await fetch(`${API_BASE}/appointments/${id}`, { method: 'DELETE' })
      fetchAppointments()
    } catch (err) {
      alert(err.message)
    }
  }

  // Stats
  const todayAppointments = appointments.filter(a => a.date === today)
  const doctors = [...new Set(appointments.map(a => a.doctorName))]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {currentView === 'dashboard' ? (
          <DashboardView
            appointments={appointments}
            todayAppointments={todayAppointments}
            doctors={doctors}
            loading={loading}
            onStatusUpdate={handleStatusUpdate}
            onDelete={handleDelete}
            onCreateClick={() => setShowCreateForm(true)}
            onNewPatientClick={() => setShowPatientForm(true)}
            onNewPrescriptionClick={() => setShowPrescriptionForm(true)}
          />
        ) : (
          <CalendarView
            appointments={appointments}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onCreateClick={() => setShowCreateForm(true)}
            showCreateForm={showCreateForm}
            setShowCreateForm={setShowCreateForm}
            onSuccess={() => { setShowCreateForm(false); fetchAppointments() }}
            onStatusUpdate={handleStatusUpdate}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Create Form Modal (for dashboard view) */}
      {showCreateForm && currentView === 'dashboard' && (
        <CreateAppointmentModal
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => { setShowCreateForm(false); fetchAppointments() }}
          selectedDate={selectedDate}
        />
      )}

      {/* New Patient Modal */}
      {showPatientForm && (
        <NewPatientModal onClose={() => setShowPatientForm(false)} />
      )}

      {/* New Prescription Modal */}
      {showPrescriptionForm && (
        <NewPrescriptionModal onClose={() => setShowPrescriptionForm(false)} />
      )}
    </div>
  )
}

// =============================================================================
// SIDEBAR
// =============================================================================

function Sidebar({ currentView, setCurrentView }) {
  const navItems = [
    { icon: Icons.Search, id: 'search' },
    { icon: Icons.Dashboard, id: 'dashboard', label: 'Overview' },
    { icon: Icons.List, id: 'list' },
    { icon: Icons.Calendar, id: 'calendar', label: 'Calendar' },
    { icon: Icons.Document, id: 'documents' },
    { icon: Icons.Users, id: 'users' },
    { icon: Icons.Settings, id: 'settings2' },
    { icon: Icons.Link, id: 'link' },
    { icon: Icons.Plus, id: 'add' },
  ]

  return (
    <div className="w-16 bg-white border-r flex flex-col items-center py-4 gap-2">
      {navItems.map((item, i) => {
        const isActive = item.id === currentView
        const isClickable = item.id === 'dashboard' || item.id === 'calendar'
        return (
          <button
            key={i}
            onClick={() => isClickable && setCurrentView(item.id)}
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center transition-all
              ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}
              ${!isClickable && 'opacity-50 cursor-default'}
            `}
          >
            <item.icon />
          </button>
        )
      })}
      <div className="flex-1" />
      <button className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
        <Icons.Settings />
      </button>
    </div>
  )
}

// =============================================================================
// DASHBOARD VIEW (Reference 1)
// =============================================================================

function DashboardView({ appointments, todayAppointments, doctors, loading, onStatusUpdate, onDelete, onCreateClick, onNewPatientClick, onNewPrescriptionClick }) {
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="p-6">
      {/* Top Navigation Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium">
          Overview
        </button>
        {['Revenue', 'Patient', 'Prescriptions', 'Pharmacy'].map(tab => (
          <button key={tab} className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium">
            {tab}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, Dr. Sarah Johnson</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search patients, appointments..."
              className="w-64 pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
            <Icons.Search />
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg relative">
            <Icons.Bell />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          icon="👥"
          iconBg="bg-blue-100"
          label="Total Patients"
          value="2,543"
          change="+12.5%"
          positive
        />
        <StatCard
          icon="📅"
          iconBg="bg-orange-100"
          label="Appointments Today"
          value={todayAppointments.length.toString()}
          change="+8.2%"
          positive
        />
        <StatCard
          icon="💰"
          iconBg="bg-green-100"
          label="Revenue (MTD)"
          value="₹4.2L"
          change="+23.1%"
          positive
        />
        <StatCard
          icon="👨‍⚕️"
          iconBg="bg-red-100"
          label="Active Doctors"
          value={`${doctors.length}/80`}
          change="-2.4%"
          positive={false}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Actions</h3>
        <div className="flex gap-4">
          <QuickActionButton icon="👤" label="New Patient" color="bg-blue-500" onClick={onNewPatientClick} />
          <QuickActionButton icon="📅" label="Book Appointment" color="bg-orange-500" onClick={onCreateClick} />
          <QuickActionButton icon="💊" label="New Prescription" color="bg-green-500" onClick={onNewPrescriptionClick} />
          <QuickActionButton icon="🔬" label="Lab Results" color="bg-red-500" onClick={() => alert('Lab Results feature coming soon!')} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="col-span-2 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Today's Appointments</h3>
            <button className="text-blue-600 text-sm hover:underline">View All →</button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No appointments today</div>
            ) : (
              todayAppointments.slice(0, 5).map(apt => (
                <AppointmentRow
                  key={apt.id}
                  appointment={apt}
                  onStatusUpdate={onStatusUpdate}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>
        </div>

        {/* Active Doctors */}
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-green-100 text-sm">Active Doctors</p>
              <p className="text-4xl font-bold">{doctors.length}<span className="text-xl text-green-200">/80</span></p>
              <p className="text-green-100 text-sm">Currently on duty</p>
            </div>
            <button className="p-2 bg-white/20 rounded-lg">
              <Icons.Users />
            </button>
          </div>
          <div className="space-y-2">
            {doctors.slice(0, 5).map((doc, i) => (
              <div key={i} className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs">
                    {doc.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-sm">{doc}</span>
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Active</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, iconBg, label, value, change, positive }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-sm">{label}</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            <span className={`text-xs ${positive ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickActionButton({ icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition"
    >
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white text-xl`}>
        {icon}
      </div>
      <span className="text-sm text-gray-600">{label}</span>
    </button>
  )
}

function AppointmentRow({ appointment, onStatusUpdate, onDelete }) {
  const statusColors = {
    Confirmed: 'bg-green-100 text-green-700',
    Scheduled: 'bg-yellow-100 text-yellow-700',
    Cancelled: 'bg-red-100 text-red-700'
  }

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <Icons.User />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{appointment.patientName}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[appointment.status]}`}>
              {appointment.status.toLowerCase()}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>👨‍⚕️ {appointment.doctorName}</span>
            <span>🕐 {appointment.time}</span>
            <span>📋 {appointment.mode}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
        {appointment.status !== 'Confirmed' && appointment.status !== 'Cancelled' && (
          <button
            onClick={() => onStatusUpdate(appointment.id, 'Confirmed')}
            className="text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded"
          >
            Confirm
          </button>
        )}
        {appointment.status !== 'Cancelled' && (
          <button
            onClick={() => onStatusUpdate(appointment.id, 'Cancelled')}
            className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded"
          >
            Cancel
          </button>
        )}
        <button onClick={() => onDelete(appointment.id)} className="p-1 hover:bg-gray-100 rounded">
          <Icons.MoreVertical />
        </button>
      </div>
    </div>
  )
}

// =============================================================================
// CALENDAR VIEW (Reference 2)
// =============================================================================

function CalendarView({ appointments, selectedDate, setSelectedDate, showCreateForm, setShowCreateForm, onSuccess, onStatusUpdate, onDelete }) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 7) // 7 AM to 6 PM

  const dateStr = selectedDate.toISOString().split('T')[0]
  const dayAppointments = appointments.filter(a => a.date === dateStr)

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  const prevDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    setSelectedDate(newDate)
  }

  const nextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    setSelectedDate(newDate)
  }

  const goToToday = () => setSelectedDate(new Date())

  // Get appointments positioned by time
  const getAppointmentStyle = (apt) => {
    const [hours, minutes] = apt.time.split(':').map(Number)
    const startMinutes = (hours - 7) * 60 + minutes
    const top = (startMinutes / 60) * 64 // 64px per hour
    const height = (apt.duration / 60) * 64
    return { top: `${top}px`, height: `${height}px` }
  }

  const getAppointmentColor = (apt) => {
    const colors = {
      'Dr. Sarah Johnson': 'bg-orange-400',
      'Dr. Michael Chen': 'bg-yellow-400',
      'Dr. James Williams': 'bg-purple-400'
    }
    return colors[apt.doctorName] || 'bg-blue-400'
  }

  return (
    <div className="flex h-full">
      {/* Calendar Main */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icons.Calendar />
              </div>
              <span className="font-semibold text-lg">Calendar</span>
            </div>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
            >
              Today
            </button>
            <div className="flex items-center gap-1">
              <button onClick={prevDay} className="p-1 hover:bg-gray-100 rounded">
                <Icons.ChevronLeft />
              </button>
              <button onClick={nextDay} className="p-1 hover:bg-gray-100 rounded">
                <Icons.ChevronRight />
              </button>
            </div>
            <span className="font-medium">{formatDate(selectedDate)}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Icons.Search />
            </button>
            <select className="border rounded-lg px-3 py-1.5 text-sm">
              <option>Day</option>
              <option>Week</option>
              <option>Month</option>
            </select>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <Icons.Plus /> Create
            </button>
          </div>
        </div>

        {/* Time Grid */}
        <div className="flex-1 overflow-auto bg-white">
          <div className="flex">
            {/* Time Column */}
            <div className="w-20 flex-shrink-0 border-r">
              <div className="h-8 border-b text-xs text-gray-400 px-2 py-1">GMT+05:30</div>
              {hours.map(hour => (
                <div key={hour} className="h-16 border-b px-2 py-1 text-xs text-gray-400">
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                </div>
              ))}
            </div>

            {/* Schedule Column */}
            <div className="flex-1 relative">
              <div className="h-8 border-b" />
              {hours.map(hour => (
                <div key={hour} className="h-16 border-b border-gray-100" />
              ))}

              {/* Appointment Blocks */}
              <div className="absolute top-8 left-2 right-2">
                {dayAppointments.map(apt => (
                  <div
                    key={apt.id}
                    className={`absolute left-0 right-0 ${getAppointmentColor(apt)} rounded-lg px-3 py-2 text-white text-sm overflow-hidden cursor-pointer hover:opacity-90 transition group`}
                    style={getAppointmentStyle(apt)}
                  >
                    <div className="font-medium truncate">{apt.mode}</div>
                    <div className="text-white/80 text-xs truncate">{apt.patientName}</div>
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1">
                      {apt.status !== 'Cancelled' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onStatusUpdate(apt.id, 'Cancelled') }}
                          className="p-1 bg-white/20 rounded hover:bg-white/40"
                        >
                          <Icons.X />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Event Panel (Reference 2 style) */}
      {showCreateForm && (
        <NewEventPanel
          onClose={() => setShowCreateForm(false)}
          onSuccess={onSuccess}
          selectedDate={selectedDate}
        />
      )}
    </div>
  )
}

// =============================================================================
// NEW EVENT PANEL (Reference 2 sidebar form)
// =============================================================================

function NewEventPanel({ onClose, onSuccess, selectedDate }) {
  const [formData, setFormData] = useState({
    patientName: '',
    date: selectedDate.toISOString().split('T')[0],
    time: '09:00',
    endTime: '09:30',
    duration: 30,
    doctorName: 'Dr. Sarah Johnson',
    mode: 'In-Person',
    phone: '',
    email: '',
    purpose: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const doctors = [
    { name: 'Dr. Sarah Johnson', specialty: 'Cardiologist' },
    { name: 'Dr. Michael Chen', specialty: 'General Physician' },
    { name: 'Dr. James Williams', specialty: 'Orthopedic' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    // Calculate duration from time range
    const [startH, startM] = formData.time.split(':').map(Number)
    const [endH, endM] = formData.endTime.split(':').map(Number)
    const duration = (endH * 60 + endM) - (startH * 60 + startM)

    try {
      const response = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: formData.patientName,
          date: formData.date,
          time: formData.time,
          duration: duration > 0 ? duration : 30,
          doctorName: formData.doctorName,
          mode: formData.mode
        })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || 'Failed to create')
      }

      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="w-96 bg-white border-l flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <Icons.X />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4 space-y-4">
        {/* Event Name */}
        <input
          type="text"
          placeholder="New Event"
          value={formData.patientName}
          onChange={(e) => setFormData({...formData, patientName: e.target.value})}
          className="w-full px-4 py-3 border-2 border-blue-500 rounded-lg text-lg focus:outline-none"
          required
        />

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
        )}

        {/* Date Display */}
        <div className="flex items-center gap-3 text-gray-600">
          <Icons.Calendar />
          <span>{formatDateDisplay(formData.date)}</span>
        </div>

        {/* Time Range */}
        <div className="flex items-center gap-3">
          <Icons.Clock />
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({...formData, time: e.target.value})}
            className="border rounded px-2 py-1"
          />
          <span>-</span>
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
            className="border rounded px-2 py-1"
          />
        </div>

        {/* Patient Name */}
        <div className="flex items-center gap-3">
          <Icons.User />
          <input
            type="text"
            placeholder="Patient Name"
            value={formData.patientName}
            onChange={(e) => setFormData({...formData, patientName: e.target.value})}
            className="flex-1 border-b py-2 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        {/* Phone */}
        <div className="flex items-center gap-3">
          <Icons.Phone />
          <input
            type="tel"
            placeholder="Add phone number"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="flex-1 border-b py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Email */}
        <div className="flex items-center gap-3">
          <Icons.Mail />
          <input
            type="email"
            placeholder="Add email address"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="flex-1 border-b py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Purpose */}
        <input
          type="text"
          placeholder="Add Purpose"
          value={formData.purpose}
          onChange={(e) => setFormData({...formData, purpose: e.target.value})}
          className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Doctor Selection */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <select
              value={formData.doctorName}
              onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
              className="flex-1 py-2 focus:outline-none"
            >
              {doctors.map(doc => (
                <option key={doc.name} value={doc.name}>
                  {doc.name} - {doc.specialty}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-400 ml-6 mt-1">Notify 30 minutes before</p>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}

// =============================================================================
// CREATE APPOINTMENT MODAL (for Dashboard view)
// =============================================================================

function CreateAppointmentModal({ onClose, onSuccess, selectedDate }) {
  const [formData, setFormData] = useState({
    patientName: '',
    date: selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    time: '09:00',
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
        throw new Error(err.detail || 'Failed to create')
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Book Appointment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icons.X />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
            <input
              type="text"
              required
              value={formData.patientName}
              onChange={(e) => setFormData({...formData, patientName: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
              <input
                type="number"
                required
                min="5"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({...formData, mode: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {modes.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <select
              required
              value={formData.doctorName}
              onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select doctor</option>
              {doctors.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// =============================================================================
// NEW PATIENT MODAL
// =============================================================================

function NewPatientModal({ onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    bloodGroup: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, this would POST to /patients endpoint
    console.log('New patient:', formData)
    setSubmitted(true)
    setTimeout(() => onClose(), 1500)
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Patient Registered!</h2>
          <p className="text-gray-500 mt-2">Patient has been added to the system.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">New Patient Registration</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icons.X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="John Smith"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <select
                required
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select blood group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
              <input
                type="tel"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="123 Main St, City, State 12345"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Register Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// =============================================================================
// NEW PRESCRIPTION MODAL
// =============================================================================

function NewPrescriptionModal({ onClose }) {
  const [formData, setFormData] = useState({
    patientName: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    diagnosis: '',
    notes: '',
    doctorName: 'Dr. Sarah Johnson'
  })
  const [submitted, setSubmitted] = useState(false)

  const doctors = ['Dr. Sarah Johnson', 'Dr. Michael Chen', 'Dr. James Williams']

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    })
  }

  const updateMedication = (index, field, value) => {
    const updated = [...formData.medications]
    updated[index][field] = value
    setFormData({ ...formData, medications: updated })
  }

  const removeMedication = (index) => {
    if (formData.medications.length > 1) {
      const updated = formData.medications.filter((_, i) => i !== index)
      setFormData({ ...formData, medications: updated })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, this would POST to /prescriptions endpoint
    console.log('New prescription:', formData)
    setSubmitted(true)
    setTimeout(() => onClose(), 1500)
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💊</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Prescription Created!</h2>
          <p className="text-gray-500 mt-2">Prescription has been saved to the system.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">New Prescription</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icons.X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
              <input
                type="text"
                required
                value={formData.patientName}
                onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prescribing Doctor *</label>
              <select
                required
                value={formData.doctorName}
                onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {doctors.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
            <input
              type="text"
              value={formData.diagnosis}
              onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Upper respiratory infection"
            />
          </div>

          {/* Medications */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Medications *</label>
              <button
                type="button"
                onClick={addMedication}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Medication
              </button>
            </div>

            <div className="space-y-3">
              {formData.medications.map((med, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Medication name"
                      value={med.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      className="col-span-2 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Dosage"
                      value={med.dosage}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-1">
                      <input
                        type="text"
                        required
                        placeholder="Frequency"
                        value={med.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      {formData.medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="px-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Duration (e.g., 7 days)"
                    value={med.duration}
                    onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                    className="mt-2 w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Special instructions, warnings, etc."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create Prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
