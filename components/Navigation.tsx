'use client'

interface Tab {
  id: string
  label: string
  icon: React.ComponentType<any>
}

interface NavigationProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export default function Navigation({ tabs, activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="flex justify-center">
      <div className="bg-white rounded-xl shadow-md p-2 inline-flex space-x-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-cosmic-100 text-cosmic-800 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}