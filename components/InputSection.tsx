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
  ScaleIcon,
  BeakerIcon,
  BoltIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'

interface InputSectionProps {
  onDataUpdate: () => void
}

interface ValidationErrors {
  [key: string]: string
}

export default function InputSection({ onDataUpdate }: InputSectionProps) {
  // Create initial form data with proper types
  const getCurrentDate = (): string => {
    return new Date().toISOString().split('T')[0]
  }

  const [formData, setFormData] = useState<Partial<SynchroData>>(() => ({
    date: getCurrentDate(),
    subjectivesynchro: 3, // Default to middle of 1-5 scale
    subjectivemood: 3,
    productivity: 3
  }))
  
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

    // Validate 1-5 scale fields
    const scaleFields = ['subjectivesynchro', 'subjectivemood', 'productivity', 'statehealth', 'staterelationship', 'stateselfesteem', 'stateinteligence', 'statesocialskill', 'stateimmerse', 'stres']
    
    scaleFields.forEach(field => {
      const value = formData[field as keyof SynchroData] as number
      if (value != null && (value < 1 || value > 5)) {
        errors[field] = `${field} must be between 1 and 5`
      }
    })

    // Sleep validation (convert hours to minutes for storage)
    if (formData.sleepavg && (formData.sleepavg < 0 || formData.sleepavg > 16)) {
      errors.sleepavg = 'Sleep hours must be between 0 and 16'
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
      // Calculate synchrosum from time slots
      const timeSlots = [
        '00:00', '01:01', '02:02', '03:03', '04:04', '05:05', '06:06', 
        '07:07', '08:08', '09:09', '10:10', '11:11', '12:12',
        '13:13', '14:14', '15:15', '16:16', '17:17', '18:18',
        '19:19', '20:20', '21:21', '22:22', '23:23'
      ]
      
      const synchrosum = timeSlots.reduce((sum, time) => {
        return sum + (formData[time as keyof SynchroData] as number || 0)
      }, 0)

      // Convert sleep hours to minutes for storage
      const dataToSubmit = {
        ...formData,
        synchrosum,
        sleepavg: formData.sleepavg ? formData.sleepavg * 60 : undefined // Convert hours to minutes
      }

      await insertSynchroData(dataToSubmit)
      setSuccess(true)
      onDataUpdate()
      
      // Reset form after success
      setTimeout(() => {
        setSuccess(false)
        setFormData({
          date: getCurrentDate(),
          subjectivesynchro: 3,
          subjectivemood: 3,
          productivity: 3
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
    min = 1, 
    max = 5, 
    step = 0.1,
    color = 'primary',
    icon: Icon,
    description
  }: {
    label: string
    field: keyof SynchroData
    min?: number
    max?: number
    step?: number
    color?: 'primary' | 'accent' | 'success'
    icon?: React.ComponentType<any>
    description?: string
  }) => {
    const value = formData[field] as number || min
    const percentage = ((value - min) / (max - min)) * 100
    
    const colorClasses = {
      primary: 'bg-primary-500',
      accent: 'bg-accent-400',
      success: 'bg-green-500'
    }

    const getValueLabel = (val: number) => {
      if (max === 5) {
        if (val <= 1.5) return 'Very Low'
        if (val <= 2.5) return 'Low'
        if (val <= 3.5) return 'Moderate'
        if (val <= 4.5) return 'High'
        return 'Very High'
      }
      return val.toFixed(1)
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 text-sm font-medium text-text-primary">
            {Icon && <Icon className="h-4 w-4 text-text-secondary" />}
            <span>{label}</span>
          </label>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${colorClasses[color]}`}>
              {value.toFixed(1)}
            </span>
            {max === 5 && (
              <div className="text-xs text-text-muted mt-1">
                {getValueLabel(value)}
              </div>
            )}
          </div>
        </div>
        
        {description && (
          <p className="text-xs text-text-secondary italic">{description}</p>
        )}
        
        <div className="relative">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => handleChange(field, parseFloat(e.target.value))}
            className="w-full"
            style={{
              background: `linear-gradient(to right, ${colorClasses[color].replace('bg-', '#')} 0%, ${colorClasses[color].replace('bg-', '#')} ${percentage}%, #e8ecf0 ${percentage}%, #e8ecf0 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-text-muted mt-1">
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
    icon: Icon,
    description,
    min,
    max
  }: {
    label: string
    field: keyof SynchroData
    placeholder?: string
    unit?: string
    icon?: React.ComponentType<any>
    description?: string
    min?: number
    max?: number
  }) => (
    <div className="space-y-2">
      <label className="flex items-center space-x-2 text-sm font-medium text-text-primary">
        {Icon && <Icon className="h-4 w-4 text-text-secondary" />}
        <span>{label}</span>
      </label>
      {description && (
        <p className="text-xs text-text-secondary italic">{description}</p>
      )}
      <div className="relative">
        <input
          type="number"
          step="0.1"
          min={min}
          max={max}
          placeholder={placeholder}
          value={formData[field] as number || ''}
          onChange={(e) => handleChange(field, e.target.value ? parseFloat(e.target.value) : null)}
          className={`input-field ${unit ? 'pr-12' : ''} ${validationErrors[field] ? 'input-error' : ''}`}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-text-muted">
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
    <div className="space-y-6">
      <div className="text-center">
        <h4 className="section-subheader">Synchronicity Events</h4>
        <p className="text-sm text-text-secondary">
          Click time slots to record synchronicity events (count = number of events at that time)
        </p>
      </div>
      
      {/* Quick Actions */}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            timeSlots.forEach(time => handleChange(time as keyof SynchroData, 0))
          }}
          className="btn-ghost text-xs"
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
          className="btn-ghost text-xs"
        >
          +1 All
        </button>
      </div>

      {/* Time Grid with improved styling */}
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {timeSlots.map(time => {
          const value = formData[time as keyof SynchroData] as number || 0
          const intensity = Math.min(value / 5, 1) // Max intensity at 5 events
          
          return (
            <div key={time} className="text-center">
              <div className="text-xs font-medium text-text-secondary mb-1">{time}</div>
              <div className="relative group">
                <div 
                  className={`time-slot ${value > 0 ? 'time-slot-filled' : 'time-slot-empty'} transition-all duration-200 hover:scale-105`}
                  style={{
                    backgroundColor: value > 0 
                      ? `rgba(51, 153, 230, ${0.3 + intensity * 0.7})`
                      : 'transparent',
                    transform: value > 0 ? 'scale(1.05)' : 'scale(1)'
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
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="text-center">
        <div className="inline-flex items-center space-x-4 text-sm">
          <span className="text-text-secondary">
            Total events: <span className="font-semibold text-text-primary">{timeSlots.reduce((sum, time) => sum + (formData[time as keyof SynchroData] as number || 0), 0)}</span>
          </span>
          <span className="badge badge-primary">
            Peak: {Math.max(...timeSlots.map(time => formData[time as keyof SynchroData] as number || 0))}
          </span>
        </div>
      </div>
    </div>
  )

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: CpuChipIcon },
    { id: 'ratings', label: 'Daily Ratings', icon: HeartIcon },
    { id: 'times', label: 'Sync Times', icon: ClockIcon },
    { id: 'health', label: 'Health & Sleep', icon: MoonIcon },
    { id: 'mental', label: 'Mental States', icon: BeakerIcon },
    { id: 'diet', label: 'Diet & Substances', icon: ScaleIcon }
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="section-header">Add New Entry</h2>
        <p className="text-text-secondary">
          Record your daily synchronicity and life metrics (1-5 scale)
        </p>
      </div>

      {/* Section Navigation with improved styling */}
      <div className="flex flex-wrap justify-center gap-2">
        {sections.map(section => {
          const Icon = section.icon
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                activeSection === section.id
                  ? 'bg-gradient-primary text-white shadow-medium'
                  : 'bg-white text-text-secondary border-2 border-gray-200 hover:border-primary-300 hover:text-text-primary hover:shadow-soft'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{section.label}</span>
            </button>
          )
        })}
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Information */}
          {activeSection === 'basic' && (
            <div className="card p-8 space-y-6">
              <h3 className="section-subheader flex items-center space-x-2">
                <CpuChipIcon className="h-5 w-5 text-primary-600" />
                <span>Basic Information</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">Date *</label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className={`input-field ${validationErrors.date ? 'input-error' : ''}`}
                    required
                  />
                  {validationErrors.date && (
                    <p className="text-red-500 text-xs">{validationErrors.date}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">Day of Week</label>
                  <input
                    type="text"
                    value={formData.day_of_the_week || ''}
                    readOnly
                    className="input-field bg-surface-secondary cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Daily Ratings */}
          {activeSection === 'ratings' && (
            <div className="card p-8 space-y-8">
              <h3 className="section-subheader flex items-center space-x-2">
                <HeartIcon className="h-5 w-5 text-red-500" />
                <span>Daily Ratings (1-5 Scale)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <RangeInput 
                  label="Synchronicity Level" 
                  field="subjectivesynchro" 
                  color="primary"
                  icon={BoltIcon}
                  description="How many meaningful coincidences did you notice?"
                />
                <RangeInput 
                  label="Mood" 
                  field="subjectivemood" 
                  color="success"
                  icon={HeartIcon}
                  description="Your overall emotional state today"
                />
                <RangeInput 
                  label="Productivity" 
                  field="productivity" 
                  color="accent"
                  description="How productive and focused were you?"
                />
              </div>
            </div>
          )}

          {/* Synchronicity Times */}
          {activeSection === 'times' && (
            <div className="card p-8">
              <h3 className="section-subheader flex items-center space-x-2">
                <ClockIcon className="h-5 w-5 text-primary-600" />
                <span>Synchronicity Times</span>
              </h3>
              <TimeSlotGrid />
            </div>
          )}

          {/* Health & Sleep */}
          {activeSection === 'health' && (
            <div className="card p-8 space-y-8">
              <h3 className="section-subheader flex items-center space-x-2">
                <MoonIcon className="h-5 w-5 text-purple-600" />
                <span>Health & Sleep</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <NumberInput 
                  label="Sleep Hours" 
                  field="sleepavg" 
                  placeholder="8.0" 
                  unit="hrs" 
                  icon={MoonIcon}
                  description="How many hours did you sleep?"
                  min={0}
                  max={16}
                />
                <NumberInput 
                  label="Heart Rate (Daily)" 
                  field="heartratedaily" 
                  placeholder="70" 
                  unit="bpm" 
                  icon={HeartIcon}
                  description="Average heart rate during active hours"
                />
                <NumberInput 
                  label="Steps" 
                  field="stepsphone" 
                  placeholder="10000" 
                  unit="steps"
                  description="Daily step count"
                />
                <NumberInput 
                  label="Weight" 
                  field="weight" 
                  placeholder="70.0" 
                  unit="kg"
                  description="Current body weight"
                />
                <div className="lg:col-span-2">
                  <RangeInput 
                    label="Stress Level" 
                    field="stres" 
                    color="accent"
                    description="How stressed or anxious did you feel?"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mental States */}
          {activeSection === 'mental' && (
            <div className="card p-8 space-y-8">
              <h3 className="section-subheader flex items-center space-x-2">
                <BeakerIcon className="h-5 w-5 text-green-600" />
                <span>Mental States (1-5 Scale)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <RangeInput 
                  label="Health State" 
                  field="statehealth" 
                  color="success"
                  description="How healthy did you feel physically?"
                />
                <RangeInput 
                  label="Relationship" 
                  field="staterelationship" 
                  color="accent"
                  description="Quality of your relationships today"
                />
                <RangeInput 
                  label="Self-esteem" 
                  field="stateselfesteem" 
                  color="primary"
                  description="How confident and positive did you feel?"
                />
                <RangeInput 
                  label="Mental Clarity" 
                  field="stateinteligence" 
                  color="primary"
                  description="How clear and sharp was your thinking?"
                />
                <RangeInput 
                  label="Social Connection" 
                  field="statesocialskill" 
                  color="success"
                  description="How well did you connect with others?"
                />
                <RangeInput 
                  label="Flow State" 
                  field="stateimmerse" 
                  color="accent"
                  description="How immersed and focused were you in activities?"
                />
              </div>
            </div>
          )}

          {/* Diet & Substances */}
          {activeSection === 'diet' && (
            <div className="card p-8 space-y-8">
              <h3 className="section-subheader flex items-center space-x-2">
                <ScaleIcon className="h-5 w-5 text-orange-600" />
                <span>Diet & Substances</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <NumberInput 
                  label="Calories" 
                  field="dietkcal" 
                  placeholder="2000" 
                  unit="kcal"
                  description="Total calories consumed"
                />
                <NumberInput 
                  label="Carbs" 
                  field="dietcarbs" 
                  placeholder="200" 
                  unit="g"
                  description="Carbohydrates in grams"
                />
                <NumberInput 
                  label="Protein" 
                  field="dietprotein" 
                  placeholder="80" 
                  unit="g"
                  description="Protein in grams"
                />
                <NumberInput 
                  label="Fats" 
                  field="dietfats" 
                  placeholder="60" 
                  unit="g"
                  description="Fats in grams"
                />
                <NumberInput 
                  label="Stimulants" 
                  field="stimmg" 
                  placeholder="0" 
                  unit="mg"
                  description="Caffeine or other stimulants"
                />
                <NumberInput 
                  label="Alcohol" 
                  field="alcohol" 
                  placeholder="0" 
                  unit="units"
                  description="Alcohol consumption"
                />
              </div>
            </div>
          )}

          {/* Submit Section */}
          <div className="flex justify-center space-x-4">
            {success ? (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-6 py-3 rounded-xl border border-green-200 shadow-soft">
                <CheckIcon className="h-5 w-5" />
                <span className="font-medium">Entry saved successfully!</span>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      date: getCurrentDate(),
                      subjectivesynchro: 3,
                      subjectivemood: 3,
                      productivity: 3
                    })
                    setValidationErrors({})
                    setActiveSection('basic')
                  }}
                  className="btn-secondary"
                >
                  <XMarkIcon className="h-5 w-5 mr-2" />
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 transform transition-all duration-200'}`}
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  {loading ? 'Saving...' : 'Save Entry'}
                </button>
              </>
            )}
          </div>

          {error && (
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
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