'use client'

import { useState, useEffect } from 'react'
import { SynchroData, insertSynchroData } from '../lib/supabase'
import { 
  PlusIcon, 
  CheckIcon, 
  XMarkIcon,
  ClockIcon,
  HeartIcon,
  MoonIcon,
  BeakerIcon,
  ScaleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface InputSectionProps {
  onDataUpdate: () => void
}

interface ValidationErrors {
  [key: string]: string
}

export default function InputSection({ onDataUpdate }: InputSectionProps) {
  const [formData, setFormData] = useState<Partial<SynchroData>>({
    date: new Date().toISOString().split('T')[0],
    subjectiveSynchro: 5,
    subjectiveMood: 5,
    productivity: 5
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [activeSection, setActiveSection] = useState<string>('basic')

  // Auto-populate day of week when date changes
  useEffect(() => {
    if (formData.date) {
      const date = new Date(formData.date)
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      setFormData(prev => ({
        ...prev,
        day_of_the_week: days[date.getDay()]
      }))
    }
  }, [formData.date])

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    if (!formData.date) {
      errors.date = 'Date is required'
    }

    if (formData.subjectiveSynchro && (formData.subjectiveSynchro < 0 || formData.subjectiveSynchro > 10)) {
      errors.subjectiveSynchro = 'Synchronicity level must be between 0 and 10'
    }

    if (formData.sleepAvg && (formData.sleepAvg < 0 || formData.sleepAvg > 24)) {
      errors.sleepAvg = 'Sleep hours must be between 0 and 24'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Calculate synchroSum from time slots
      const timeSlots = [
        '00:00', '01:01', '02:02', '03:03', '04:04', '05:05', '06:06', 
        '07:07', '08:08', '09:09', '10:10', '11:11', '12:12',
        '13:13', '14:14', '15:15', '16:16', '17:17', '18:18',
        '19:19', '20:20', '21:21', '22:22', '23:23'
      ]
      
      const synchroSum = timeSlots.reduce((sum, time) => {
        return sum + (formData[time as keyof SynchroData] as number || 0)
      }, 0)

      const dataToSubmit = {
        ...formData,
        synchroSum
      }

      await insertSynchroData(dataToSubmit)
      setSuccess(true)
      onDataUpdate()
      
      // Reset form after success
      setTimeout(() => {
        setSuccess(false)
        setFormData({
          date: new Date().toISOString().split('T')[0],
          subjectiveSynchro: 5,
          subjectiveMood: 5,
          productivity: 5
        })
        setActiveSection('basic')
      }, 2000)
    } catch (err) {
      setError('Failed to save entry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof SynchroData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const timeSlots = [
    '00:00', '01:01', '02:02', '03:03', '04:04', '05:05', '06:06', 
    '07:07', '08:08', '09:09', '10:10', '11:11', '12:12',
    '13:13', '14:14', '15:15', '16:16', '17:17', '18:18',
    '19:19', '20:20', '21:21', '22:22', '23:23'
  ]

  const RangeInput = ({ 
    label, 
    field, 
    min = 0, 
    max = 10, 
    step = 0.1,
    color = 'cosmic',
    icon: Icon
  }: {
    label: string
    field: keyof SynchroData
    min?: number
    max?: number
    step?: number
    color?: 'cosmic' | 'synchro' | 'green' | 'blue'
    icon?: React.ComponentType<any>
  }) => {
    const value = formData[field] as number || 0
    const percentage = ((value - min) / (max - min)) * 100
    
    const colorClasses = {
      cosmic: 'from-cosmic-400 to-cosmic-600',
      synchro: 'from-synchro-400 to-synchro-600', 
      green: 'from-green-400 to-green-600',
      blue: 'from-blue-400 to-blue-600'
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            {Icon && <Icon className="h-4 w-4" />}
            <span>{label}</span>
          </label>
          <span className={`px-2 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${colorClasses[color]} text-white`}>
            {value.toFixed(1)}
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => handleChange(field, parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${percentage}%, rgb(229, 231, 235) ${percentage}%, rgb(229, 231, 235) 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>
        {validationErrors[field] && (
          <p className="text-red-500 text-xs">{validationErrors[field]}</p>
        )}
      </div>
    )
  }

  const NumberInput = ({ 
    label, 
    field, 
    placeholder = '0',
    unit = '',
    icon: Icon
  }: {
    label: string
    field: keyof SynchroData
    placeholder?: string
    unit?: string
    icon?: React.ComponentType<any>
  }) => (
    <div className="space-y-2">
      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
      </label>
      <div className="relative">
        <input
          type="number"
          step="0.1"
          placeholder={placeholder}
          value={formData[field] as number || ''}
          onChange={(e) => handleChange(field, e.target.value ? parseFloat(e.target.value) : null)}
          className={`input-field ${unit ? 'pr-12' : ''} ${validationErrors[field] ? 'border-red-300 focus:ring-red-500' : ''}`}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
            {unit}
          </span>
        )}
      </div>
      {validationErrors[field] && (
        <p className="text-red-500 text-xs">{validationErrors[field]}</p>
      )}
    </div>
  )

  // Enhanced Time Slots Grid
  const TimeSlotGrid = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">Synchronicity Time Events</h4>
        <p className="text-sm text-gray-600">
          Click on time slots to record synchronicity events, or use the quick add buttons
        </p>
      </div>
      
      {/* Quick Actions */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => {
            timeSlots.forEach(time => handleChange(time as keyof SynchroData, 0))
          }}
          className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
        >
          Clear All
        </button>
        <button
          type="button"
          onClick={() => {
            timeSlots.forEach(time => {
              const current = formData[time as keyof SynchroData] as number || 0
              handleChange(time as keyof SynchroData, current + 1)
            })
          }}
          className="px-3 py-1 text-xs bg-cosmic-200 hover:bg-cosmic-300 text-cosmic-800 rounded-full transition-colors"
        >
          +1 All
        </button>
      </div>

      {/* Time Grid */}
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {timeSlots.map(time => {
          const value = formData[time as keyof SynchroData] as number || 0
          const intensity = Math.min(value / 5, 1) // Scale for visual intensity
          
          return (
            <div key={time} className="text-center">
              <div className="text-xs font-medium text-gray-600 mb-1">{time}</div>
              <div className="relative group">
                <div 
                  className={`w-full h-12 rounded-lg border-2 transition-all duration-200 cursor-pointer flex items-center justify-center text-sm font-semibold
                    ${value > 0 
                      ? 'border-cosmic-400 text-white shadow-md' 
                      : 'border-gray-200 hover:border-cosmic-300 text-gray-400 hover:text-gray-600'
                    }`}
                  style={{
                    backgroundColor: value > 0 
                      ? `rgba(14, 165, 233, ${0.3 + intensity * 0.7})`
                      : 'transparent'
                  }}
                  onClick={() => handleChange(time as keyof SynchroData, value + 1)}
                >
                  {value || '+'}
                </div>
                
                {/* Quick decrement */}
                {value > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleChange(time as keyof SynchroData, Math.max(0, value - 1))
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="text-center text-xs text-gray-500">
        Total events: {timeSlots.reduce((sum, time) => sum + (formData[time as keyof SynchroData] as number || 0), 0)}
      </div>
    </div>
  )

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: SparklesIcon },
    { id: 'ratings', label: 'Daily Ratings', icon: HeartIcon },
    { id: 'times', label: 'Synchro Times', icon: ClockIcon },
    { id: 'health', label: 'Health & Sleep', icon: MoonIcon },
    { id: 'mental', label: 'Mental States', icon: BeakerIcon },
    { id: 'diet', label: 'Diet & Substances', icon: ScaleIcon }
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cosmic-600 to-synchro-600 bg-clip-text text-transparent mb-2">
          Add New Entry
        </h2>
        <p className="text-gray-600 text-lg">
          Record your synchronicities and daily metrics
        </p>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap justify-center gap-2">
        {sections.map(section => {
          const Icon = section.icon
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-cosmic-500 to-synchro-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-cosmic-300 hover:shadow-sm'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{section.label}</span>
            </button>
          )
        })}
      </div>

      {/* Form */}
      <div className="max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Information */}
          {activeSection === 'basic' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <SparklesIcon className="h-6 w-6 text-cosmic-600" />
                <span>Basic Information</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Date *</label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className={`input-field ${validationErrors.date ? 'border-red-300 focus:ring-red-500' : ''}`}
                    required
                  />
                  {validationErrors.date && (
                    <p className="text-red-500 text-xs">{validationErrors.date}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Day of Week</label>
                  <input
                    type="text"
                    value={formData.day_of_the_week || ''}
                    readOnly
                    className="input-field bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Daily Ratings */}
          {activeSection === 'ratings' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <HeartIcon className="h-6 w-6 text-red-500" />
                <span>Daily Ratings</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <RangeInput 
                  label="Synchronicity Level" 
                  field="subjectiveSynchro" 
                  color="cosmic"
                  icon={SparklesIcon}
                />
                <RangeInput 
                  label="Mood" 
                  field="subjectiveMood" 
                  color="green"
                  icon={HeartIcon}
                />
                <RangeInput 
                  label="Productivity" 
                  field="productivity" 
                  color="blue"
                />
              </div>
            </div>
          )}

          {/* Synchronicity Times */}
          {activeSection === 'times' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <ClockIcon className="h-6 w-6 text-cosmic-600" />
                <span>Synchronicity Times</span>
              </h3>
              <TimeSlotGrid />
            </div>
          )}

          {/* Health & Sleep */}
          {activeSection === 'health' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <MoonIcon className="h-6 w-6 text-purple-600" />
                <span>Health & Sleep</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <NumberInput label="Sleep Hours" field="sleepAvg" placeholder="8.0" unit="hrs" icon={MoonIcon} />
                <NumberInput label="Heart Rate (Daily)" field="heartrateDaily" placeholder="70" unit="bpm" icon={HeartIcon} />
                <NumberInput label="Heart Rate (Resting)" field="heartrateResting" placeholder="60" unit="bpm" />
                <NumberInput label="Steps" field="stepsPhone" placeholder="10000" unit="steps" />
                <NumberInput label="Weight" field="weight" placeholder="70.0" unit="kg" />
                <div>
                  <RangeInput label="Stress Level" field="stres" color="synchro" />
                </div>
              </div>
            </div>
          )}

          {/* Mental States */}
          {activeSection === 'mental' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <BeakerIcon className="h-6 w-6 text-green-600" />
                <span>Mental States</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <RangeInput label="Health State" field="stateHealth" color="green" />
                <RangeInput label="Relationship State" field="stateRelationship" color="synchro" />
                <RangeInput label="Self-esteem" field="stateSelfesteem" color="blue" />
                <RangeInput label="Intelligence State" field="stateInteligence" color="cosmic" />
                <RangeInput label="Social Skills" field="stateSocialSkill" color="green" />
                <RangeInput label="Immersion State" field="stateImmerse" color="synchro" />
              </div>
            </div>
          )}

          {/* Diet & Substances */}
          {activeSection === 'diet' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <ScaleIcon className="h-6 w-6 text-orange-600" />
                <span>Diet & Substances</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <NumberInput label="Calories" field="dietKcal" placeholder="2000" unit="kcal" />
                <NumberInput label="Carbs" field="dietCarbs" placeholder="200" unit="g" />
                <NumberInput label="Protein" field="dietProtein" placeholder="80" unit="g" />
                <NumberInput label="Fats" field="dietFats" placeholder="60" unit="g" />
                <NumberInput label="Stimulants" field="stimMg" placeholder="0" unit="mg" />
                <NumberInput label="Alcohol" field="alcohol" placeholder="0" unit="units" />
              </div>
            </div>
          )}

          {/* Submit Section */}
          <div className="flex justify-center space-x-4">
            {success ? (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-6 py-3 rounded-lg">
                <CheckIcon className="h-5 w-5" />
                <span className="font-medium">Entry saved successfully!</span>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      date: new Date().toISOString().split('T')[0],
                      subjectiveSynchro: 5,
                      subjectiveMood: 5,
                      productivity: 5
                    })
                    setValidationErrors({})
                    setActiveSection('basic')
                  }}
                  className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                  <span>Reset</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg
                    ${loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-cosmic-600 to-synchro-600 hover:from-cosmic-700 hover:to-synchro-700 text-white'
                    }
                  `}
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>{loading ? 'Saving...' : 'Save Entry'}</span>
                </button>
              </>
            )}
          </div>

          {error && (
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                <XMarkIcon className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}