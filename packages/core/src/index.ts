// Core constants and utilities for Elysia demo

export const DEMO_PROPERTY = {
  name: 'The Meridian Apartments',
  address: '123 Luxury Lane, Downtown District',
  phone: '(555) 123-4567',
  email: 'concierge@meridianappartments.com',
  website: 'www.meridianappartments.com'
}

export const BRAND = {
  name: 'Elysia',
  tagline: 'Your community. Your connection. Your concierge.',
  colors: {
    primary: '#a855f7',
    secondary: '#c084fc',
    accent: '#fbbf24',
    text: '#1f2937',
    background: '#ffffff'
  }
}

export const DEMO_FEATURES = {
  concierge: {
    name: 'Resident Concierge Chat',
    description: 'AI-powered 24/7 assistance for residents',
    capabilities: [
      'Answer questions about amenities',
      'Provide policy information',
      'Assist with service requests',
      'Share community updates'
    ]
  },
  announcements: {
    name: 'Community Announcements',
    description: 'Real-time updates and event notifications',
    features: [
      'Priority-based messaging',
      'Event RSVP integration',
      'Maintenance notifications',
      'Emergency alerts'
    ]
  },
  requests: {
    name: 'Maintenance Requests',
    description: 'Streamlined request submission and tracking',
    benefits: [
      'Simple form-based submission',
      'Real-time status tracking',
      'Priority categorization',
      'Emergency contact integration'
    ]
  }
}

export const SAMPLE_QUESTIONS = [
  'What are the pool hours?',
  'How do I access the gym?',
  'Where can I park my car?',
  'When will my package arrive?',
  'How do I submit a maintenance request?',
  'What are the quiet hours?',
  'How do I add guests to the visitor list?',
  'What are the office hours?'
]

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}