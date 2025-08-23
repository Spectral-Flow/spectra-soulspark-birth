import { useState } from 'react'
import { MessageCircle, Megaphone, Settings, Menu, Home, Users } from 'lucide-react'
import ConciergeChat from './components/ConciergeChat'
import CommunityAnnouncements from './components/CommunityAnnouncements'
import ResidentRequests from './components/ResidentRequests'

type TabType = 'home' | 'chat' | 'announcements' | 'requests'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home')

  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'chat' as const, label: 'Concierge', icon: MessageCircle },
    { id: 'announcements' as const, label: 'Updates', icon: Megaphone },
    { id: 'requests' as const, label: 'Requests', icon: Settings },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ConciergeChat />
      case 'announcements':
        return <CommunityAnnouncements />
      case 'requests':
        return <ResidentRequests />
      default:
        return <HomeView />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-gold-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold elysia-text-gradient">Elysia</h1>
              <p className="text-sm text-gray-600">Your community concierge</p>
            </div>
          </div>
          <div className="hidden md:flex space-x-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === id
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-purple-100">
        <div className="flex">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center py-3 px-2 ${
                activeTab === id
                  ? 'text-primary-600'
                  : 'text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

// Home View Component
function HomeView() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          Welcome to <span className="elysia-text-gradient">Elysia</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Your community. Your connection. Your concierge.
        </p>
        <div className="text-lg text-gray-700 mb-8">
          Experience luxury living with intelligent community management
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <FeatureCard
          icon={MessageCircle}
          title="24/7 Concierge"
          description="Get instant answers to your questions anytime, anywhere"
          gradient="from-purple-500 to-purple-600"
        />
        <FeatureCard
          icon={Megaphone}
          title="Community Updates"
          description="Stay informed about events, news, and important announcements"
          gradient="from-blue-500 to-blue-600"
        />
        <FeatureCard
          icon={Settings}
          title="Easy Requests"
          description="Submit and track maintenance requests with simple forms"
          gradient="from-gold-500 to-gold-600"
        />
      </div>

      {/* Demo Property Info */}
      <div className="elysia-card p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">The Meridian Apartments</h2>
        <p className="text-gray-600 mb-4">
          Luxury boutique living in the heart of the city
        </p>
        <p className="text-sm text-gray-500">
          This is a demo showcasing Elysia's intelligent community management capabilities
        </p>
      </div>
    </div>
  )
}

// Feature Card Component
interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  gradient: string
}

function FeatureCard({ icon: Icon, title, description, gradient }: FeatureCardProps) {
  return (
    <div className="elysia-card p-6 hover:shadow-xl transition-all duration-300 group">
      <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

export default App