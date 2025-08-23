import { Calendar, MapPin, Users, Clock, Megaphone } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content: string
  type: 'event' | 'maintenance' | 'update' | 'emergency'
  date: Date
  priority: 'low' | 'medium' | 'high'
  location?: string
  duration?: string
}

const SAMPLE_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    title: 'Summer Pool Party - This Saturday!',
    content: 'Join us for our annual summer pool party this Saturday from 2-6 PM. Enjoy BBQ, music, and complimentary refreshments. RSVP at the concierge desk or through the resident portal.',
    type: 'event',
    date: new Date('2024-07-15T14:00:00'),
    priority: 'medium',
    location: 'Pool Deck',
    duration: '4 hours'
  },
  {
    id: '2',
    title: 'Elevator Maintenance - North Tower',
    content: 'The north tower elevator will be out of service for routine maintenance on Tuesday, July 16th from 9 AM to 3 PM. The south elevator will remain operational. We apologize for any inconvenience.',
    type: 'maintenance',
    date: new Date('2024-07-16T09:00:00'),
    priority: 'high',
    location: 'North Tower',
    duration: '6 hours'
  },
  {
    id: '3',
    title: 'New Package Room Hours',
    content: 'Effective immediately, the package room is now accessible 24/7 with your key fob. No more waiting for business hours to collect your deliveries! Contact the front desk if you experience any access issues.',
    type: 'update',
    date: new Date('2024-07-10T08:00:00'),
    priority: 'low'
  }
]

const getTypeIcon = (type: Announcement['type']) => {
  switch (type) {
    case 'event':
      return Calendar
    case 'maintenance':
      return Clock
    case 'update':
      return Megaphone
    case 'emergency':
      return Megaphone
    default:
      return Megaphone
  }
}

const getTypeColor = (type: Announcement['type']) => {
  switch (type) {
    case 'event':
      return 'bg-blue-100 text-blue-800'
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800'
    case 'update':
      return 'bg-green-100 text-green-800'
    case 'emergency':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getPriorityBorder = (priority: Announcement['priority']) => {
  switch (priority) {
    case 'high':
      return 'border-l-4 border-red-500'
    case 'medium':
      return 'border-l-4 border-yellow-500'
    case 'low':
      return 'border-l-4 border-green-500'
    default:
      return 'border-l-4 border-gray-300'
  }
}

export default function CommunityAnnouncements() {
  const sortedAnnouncements = SAMPLE_ANNOUNCEMENTS
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Community <span className="elysia-text-gradient">Announcements</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Stay up to date with the latest news, events, and important information 
          from The Meridian Apartments community.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="elysia-card p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">3</div>
          <div className="text-sm text-gray-600">Active Announcements</div>
        </div>
        <div className="elysia-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">1</div>
          <div className="text-sm text-gray-600">Upcoming Events</div>
        </div>
        <div className="elysia-card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">1</div>
          <div className="text-sm text-gray-600">Maintenance Notices</div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {sortedAnnouncements.map((announcement) => {
          const Icon = getTypeIcon(announcement.type)
          return (
            <div 
              key={announcement.id}
              className={`elysia-card p-6 ${getPriorityBorder(announcement.priority)} hover:shadow-lg transition-shadow duration-200`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(announcement.type)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {announcement.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{announcement.date.toLocaleDateString()}</span>
                      </span>
                      {announcement.location && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{announcement.location}</span>
                        </span>
                      )}
                      {announcement.duration && (
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{announcement.duration}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(announcement.type)}`}>
                    {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    announcement.priority === 'high' 
                      ? 'bg-red-100 text-red-800'
                      : announcement.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {announcement.priority} priority
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                {announcement.content}
              </p>

              {announcement.type === 'event' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>Community Event</span>
                      </span>
                    </div>
                    <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
                      RSVP
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="elysia-card p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Stay Connected
        </h3>
        <p className="text-gray-600 mb-4">
          Get announcements delivered directly to your email or mobile device
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="elysia-button">
            Update Notification Preferences
          </button>
          <button className="px-6 py-2 border border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium">
            View All Announcements
          </button>
        </div>
      </div>
    </div>
  )
}