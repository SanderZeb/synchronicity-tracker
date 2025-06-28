'use client'

interface Tab {
  id: string
  label: string
  icon: React.ComponentType<any>
  description?: string
}

interface NavigationProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export default function Navigation({ tabs, activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="flex justify-center">
      <nav className="relative bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-2 inline-flex space-x-1 border border-gray-200/50">
        {/* Background gradient for active tab */}
        <div
          className="absolute top-2 bg-gradient-to-r from-cosmic-500 to-synchro-500 rounded-xl transition-all duration-300 ease-out shadow-lg"
          style={{
            width: `${100 / tabs.length}%`,
            height: 'calc(100% - 16px)',
            left: `${(tabs.findIndex(tab => tab.id === activeTab) * 100) / tabs.length}%`,
            transform: 'translateX(8px)'
          }}
        />
        
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative z-10 group flex items-center space-x-3 px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 min-w-0
                ${isActive 
                  ? 'text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }
              `}
            >
              <Icon className={`h-5 w-5 transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
              <div className="text-left">
                <div className={`font-semibold text-sm transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'}`}>
                  {tab.label}
                </div>
                {tab.description && (
                  <div className={`text-xs transition-all duration-300 ${isActive ? 'text-white/80' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    {tab.description}
                  </div>
                )}
              </div>
              
              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
              
              {/* Hover effect */}
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-cosmic-500/10 to-synchro-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isActive ? 'hidden' : ''}`} />
            </button>
          )
        })}
      </nav>
    </div>
  )
}