import { useState } from 'react'
import { Wrench, Lightbulb, Droplet, Zap, Wind, Shield, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface Request {
  id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'emergency'
  status: 'submitted' | 'in-progress' | 'completed'
  submitDate: Date
  completedDate?: Date
}

const REQUEST_CATEGORIES = [
  { id: 'plumbing', label: 'Plumbing', icon: Droplet },
  { id: 'electrical', label: 'Electrical', icon: Zap },
  { id: 'hvac', label: 'HVAC', icon: Wind },
  { id: 'lighting', label: 'Lighting', icon: Lightbulb },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'general', label: 'General Maintenance', icon: Wrench },
]

const SAMPLE_REQUESTS: Request[] = [
  {
    id: '1',
    title: 'Kitchen faucet dripping',
    description: 'The kitchen faucet has been dripping continuously for the past two days.',
    category: 'plumbing',
    priority: 'medium',
    status: 'in-progress',
    submitDate: new Date('2024-07-14T10:30:00'),
  },
  {
    id: '2',
    title: 'Light bulb out in bathroom',
    description: 'The ceiling light in the master bathroom is not working.',
    category: 'lighting',
    priority: 'low',
    status: 'completed',
    submitDate: new Date('2024-07-12T14:20:00'),
    completedDate: new Date('2024-07-13T09:15:00'),
  },
]

export default function ResidentRequests() {
  const [requests, setRequests] = useState<Request[]>(SAMPLE_REQUESTS)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'emergency',
    unitNumber: '',
    contactInfo: '',
    preferredTime: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.category) {
      alert('Please fill in all required fields')
      return
    }

    const newRequest: Request = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      status: 'submitted',
      submitDate: new Date(),
    }

    setRequests(prev => [newRequest, ...prev])
    setFormData({
      title: '',
      description: '',
      category: '',
      priority: 'medium' as 'low' | 'medium' | 'high' | 'emergency',
      unitNumber: '',
      contactInfo: '',
      preferredTime: '',
    })
    setShowForm(false)
    
    // Show success message
    alert('Request submitted successfully! You will receive updates via email and through the resident portal.')
  }

  const getStatusIcon = (status: Request['status']) => {
    switch (status) {
      case 'submitted':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'in-progress':
        return <AlertCircle className="w-4 h-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
    }
  }

  const getStatusColor = (status: Request['status']) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
    }
  }

  const getPriorityColor = (priority: Request['priority']) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = REQUEST_CATEGORIES.find(cat => cat.id === categoryId)
    return category?.icon || Wrench
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Maintenance <span className="elysia-text-gradient">Requests</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Submit and track maintenance requests for your unit. Our team typically responds within 24 hours.
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="elysia-button"
        >
          {showForm ? 'Cancel' : 'Submit New Request'}
        </button>
      </div>

      {/* New Request Form */}
      {showForm && (
        <div className="elysia-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">New Maintenance Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Number *
                </label>
                <input
                  type="text"
                  value={formData.unitNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, unitNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 4B"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Request Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Brief description of the issue"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  {REQUEST_CATEGORIES.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' | 'emergency' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="low">Low - Can wait a few days</option>
                  <option value="medium">Medium - Should be fixed soon</option>
                  <option value="high">High - Needs quick attention</option>
                  <option value="emergency">Emergency - Immediate assistance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Please provide detailed information about the issue, including location and any relevant details..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Time for Access
              </label>
              <input
                type="text"
                value={formData.preferredTime}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Weekdays 9 AM - 5 PM, or anytime"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="elysia-button flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Request</span>
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Requests */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Your Recent Requests</h2>
        
        {requests.length === 0 ? (
          <div className="elysia-card p-8 text-center">
            <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
            <p className="text-gray-600">Submit your first maintenance request to get started.</p>
          </div>
        ) : (
          requests.map((request) => {
            const CategoryIcon = getCategoryIcon(request.category)
            const categoryLabel = REQUEST_CATEGORIES.find(cat => cat.id === request.category)?.label || 'General'
            
            return (
              <div key={request.id} className="elysia-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <CategoryIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                      <p className="text-sm text-gray-600">{categoryLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority} priority
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span>{request.status.replace('-', ' ')}</span>
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">{request.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Submitted: {request.submitDate.toLocaleDateString()}</span>
                  {request.completedDate && (
                    <span>Completed: {request.completedDate.toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Emergency Contact */}
      <div className="elysia-card p-6 bg-red-50 border-red-200">
        <h3 className="text-lg font-semibold text-red-900 mb-2 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>Emergency Maintenance</span>
        </h3>
        <p className="text-red-700 mb-4">
          For urgent issues like water leaks, power outages, or security concerns, 
          call our 24/7 emergency maintenance line immediately.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a 
            href="tel:555-123-4567" 
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-center"
          >
            Call Emergency Line: (555) 123-4567
          </a>
          <button className="px-6 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
            View Emergency Procedures
          </button>
        </div>
      </div>
    </div>
  )
}