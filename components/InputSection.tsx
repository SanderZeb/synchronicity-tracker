'use client'

import { useState } from 'react'
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
  SunIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface InputSectionProps {
  onDataUpdate: () => void
}

interface ValidationErrors {
  [key: string]: string
}

export default function InputSection({ onDataUpdate }: InputSectionProps) {
  const getCurrentDate = (): string => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [formData, setFormData] = useState<Partial<SynchroData>>(() => {
    const currentDate = getCurrentDate()
    return {
      date: currentDate,
      subjectivesynchro: 3,
      subjectivemood: 3,
      productivity: 3,
      statehealth: 3,
      staterelationship: 3,
      stateselfesteem: 3,
      stateinteligence: 3,
      statesocialskill: 3,
      stateimmerse: 3,
      stres: 3,
      sleepavg: 8
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  const timeSlots = [
    '01:01', '02:02', '03:03', '04:04', '05:05', '06:06', 
    '07:07', '08:08', '09:09', '10:10', '11:11', '12:12',
    '13:13', '14:14', '15:15', '16:16', '17:17', '18:18',
    '19:19', '20:20', '21:21', '22:22', '23:23', '00:00'
  ]

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    if (!formData.date) {
      errors.date = 'Date is required'
    }

    const scaleFields = [
      'subjectivesynchro', 'subjectivemood', 'productivity', 'statehealth', 
      'staterelationship', 'stateselfesteem', 'stateinteligence', 
      'statesocialskill', 'stateimmerse', 'stres'
    ]
    
    scaleFields.forEach(field => {
      const value = formData[field as keyof SynchroData] as number
      if (value != null && (value < 1 || value > 5 || !Number.isInteger(value))) {
        errors[field] = `${field} must be an integer between 1 and 5`
      }
    })

    if (formData.sleepavg && (formData.sleepavg < 0 || formData.sleepavg > 16)) {
      errors.sleepavg = 'Sleep hours must be between 0 and 16'
    }

    timeSlots.forEach(time => {
      const value = formData[time as keyof SynchroData] as number
      if (value != null && (value < 1 || value > 5 || !Number.isInteger(value))) {
        errors[time] = `${time} must be an integer between 1 and 5`
      }
    })

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
      const synchrosum = timeSlots.reduce((sum, time) => {
        return sum + ((formData[time as keyof SynchroData] as number) || 0)
      }, 0)

      const dataToSubmit: Partial<SynchroData> = {
        ...formData,
        synchrosum,
        ...(formData.sleepavg && { sleepavg: formData.sleepavg * 60 })
      }

      if (formData.date) {
        const date = new Date(formData.date)
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        dataToSubmit.day_of_the_week = days[date.getDay()]
      }

      await insertSynchroData(dataToSubmit)
      setSuccess(true)
      onDataUpdate()
      
      setTimeout(() => {
        setSuccess(false)
        const currentDate = getCurrentDate()
        setFormData({
          date: currentDate,
          subjectivesynchro: 3,
          subjectivemood: 3,
          productivity: 3,
          statehealth: 3,
          staterelationship: 3,
          stateselfesteem: 3,
          stateinteligence: 3,
          statesocialskill: 3,
          stateimmerse: 3,
          stres: 3,
          sleepavg: 8
        })
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
    
    if (validationErrors[field as string]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field as string]
        return newErrors
      })
    }
  }

  const IntegerSelect = ({ 
    label, 
    field, 
    icon: Icon,
    description,
    color = 'primary'
  }: {
    label: string
    field: keyof SynchroData
    icon?: React.ComponentType<any>
    description?: string
    color?: 'primary' | 'accent' | 'success' | 'warning' | 'purple'
  }) => {
    const value = (formData[field] as number) || 3
    
    const colorClasses = {
      primary: 'border-primary-300 focus:border-primary-500',
      accent: 'border-accent-300 focus:border-accent-500',
      success: 'border-green-300 focus:border-green-500',
      warning: 'border-orange-300 focus:border-orange-500',
      purple: 'border-purple-300 focus:border-purple-500'
    }

    const getValueLabel = (val: number) => {
      if (val === 1) return 'Very Low'
      if (val === 2) return 'Low'
      if (val === 3) return 'Moderate'
      if (val === 4) return 'High'
      if (val === 5) return 'Very High'
      return val.toString()
    }

    return (
      <div className="space-y-2">
        <label className="flex items-center justify-between text-sm font-medium text-text-primary">
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="h-4 w-4 text-text-secondary" />}
            <span>{label}</span>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            value >= 4 ? 'bg-green-100 text-green-800' :
            value >= 3 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {value} - {getValueLabel(value)}
          </span>
        </label>
        
        {description && (
          <p className="text-xs text-text-secondary italic">{description}</p>
        )}
        
        <select
          value={value}
          onChange={(e) => handleChange(field, parseInt(e.target.value))}
          className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all duration-200 ${colorClasses[color]}`}
        >
          <option value={1}>1 - Very Low</option>
          <option value={2}>2 - Low</option>
          <option value={3}>3 - Moderate</option>
          <option value={4}>4 - High</option>
          <option value={5}>5 - Very High</option>
        </select>
        
        {validationErrors[field as string] && (
          <p className="text-red-500 text-xs">{validationErrors[field as string]}</p>
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
    max,
    step = 1
  }: {
    label: string
    field: keyof SynchroData
    placeholder?: string
    unit?: string
    icon?: React.ComponentType<any>
    description?: string
    min?: number
    max?: number
    step?: number
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
          step={step}
          min={min}
          max={max}
          placeholder={placeholder}
          value={formData[field] as number || ''}
          onChange={(e) => {
            const newValue = e.target.value ? parseFloat(e.target.value) : undefined
            handleChange(field, newValue)
          }}
          className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${unit ? 'pr-12' : ''} ${validationErrors[field as string] ? 'border-red-300' : ''}`}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-text-muted">
            {unit}
          </span>
        )}
      </div>
      {validationErrors[field as string] && (
        <p className="text-red-500 text-xs">{validationErrors[field as string]}</p>
      )}
    </div>
  )

  const TimeSlotGrid = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-text-primary flex items-center space-x-2">
          <ClockIcon className="h-5 w-5 text-primary-600" />
          <span>Synchronicity Time Slots (1-5 Scale)</span>
        </h4>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => {
              timeSlots.forEach(time => handleChange(time as keyof SynchroData, undefined))
            }}
            className="btn-ghost text-sm"
          >
            Clear All
          </button>
        </div>
      </div>
      
      <p className="text-sm text-text-secondary">
        Select the intensity (1-5) for each time slot when you experienced synchronicities
      </p>

      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {timeSlots.map(time => {
          const value = (formData[time as keyof SynchroData] as number) || undefined
          
          return (
            <div key={time} className="space-y-2">
              <div className="text-center">
                <div className="text-xs font-medium text-text-secondary mb-1">{time}</div>
                <select
                  value={value || ''}
                  onChange={(e) => {
                    const newValue = e.target.value ? parseInt(e.target.value) : undefined
                    handleChange(time as keyof SynchroData, newValue)
                  }}
                  className={`w-full px-2 py-1 text-xs border-2 rounded focus:outline-none transition-all duration-200 ${
                    value 
                      ? `border-primary-400 bg-primary-50 text-primary-800` 
                      : 'border-gray-300 bg-white text-text-muted'
                  }`}
                >
                  <option value="">-</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </div>
              {validationErrors[time] && (
                <p className="text-red-500 text-xs text-center">{validationErrors[time]}</p>
              )}
            </div>
          )
        })}
      </div>
      
      <div className="bg-primary-50 rounded-lg p-4 mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">
            Total events: <span className="font-semibold text-text-primary">
              {timeSlots.reduce((sum, time) => sum + ((formData[time as keyof SynchroData] as number) || 0), 0)}
            </span>
          </span>
          <span className="text-primary-600 font-medium">
            Scale: 1=Very Low → 5=Very High
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="section-header">Add New Entry</h2>
        <p className="text-text-secondary">
          Record your daily synchronicity and life metrics (1-5 integer scale)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8">
        
        <div className="card p-6 space-y-6">
          <h3 className="text-xl font-bold text-text-primary flex items-center space-x-2">
            <CalendarIcon className="h-6 w-6 text-primary-600" />
            <span>Basic Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">Date *</label>
              <input
                type="date"
                value={formData.date || getCurrentDate()}
                onChange={(e) => handleChange('date', e.target.value || getCurrentDate())}
                className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${validationErrors.date ? 'border-red-300' : ''}`}
                required
              />
              {validationErrors.date && (
                <p className="text-red-500 text-xs">{validationErrors.date}</p>
              )}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <TimeSlotGrid />
        </div>

        <div className="card p-6 space-y-6">
          <h3 className="text-xl font-bold text-text-primary flex items-center space-x-2">
            <BoltIcon className="h-6 w-6 text-primary-600" />
            <span>Main Daily Ratings (1-5 Integer Scale)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <IntegerSelect 
              label="Synchronicity Level" 
              field="subjectivesynchro" 
              color="primary"
              icon={BoltIcon}
              description="How many meaningful coincidences did you notice?"
            />
            <IntegerSelect 
              label="Mood" 
              field="subjectivemood" 
              color="success"
              icon={HeartIcon}
              description="Your overall emotional state today"
            />
            <IntegerSelect 
              label="Productivity" 
              field="productivity" 
              color="accent"
              icon={SunIcon}
              description="How productive and focused were you?"
            />
          </div>
        </div>

        <div className="card p-6 space-y-6">
          <h3 className="text-xl font-bold text-text-primary flex items-center space-x-2">
            <BeakerIcon className="h-6 w-6 text-green-600" />
            <span>Mental States (1-5 Integer Scale)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <IntegerSelect 
              label="Health State" 
              field="statehealth" 
              color="success"
              description="How healthy did you feel physically?"
            />
            <IntegerSelect 
              label="Relationship" 
              field="staterelationship" 
              color="accent"
              description="Quality of your relationships today"
            />
            <IntegerSelect 
              label="Self-esteem" 
              field="stateselfesteem" 
              color="primary"
              description="How confident and positive did you feel?"
            />
            <IntegerSelect 
              label="Mental Clarity" 
              field="stateinteligence" 
              color="primary"
              description="How clear and sharp was your thinking?"
            />
            <IntegerSelect 
              label="Social Connection" 
              field="statesocialskill" 
              color="success"
              description="How well did you connect with others?"
            />
            <IntegerSelect 
              label="Flow State" 
              field="stateimmerse" 
              color="accent"
              description="How immersed and focused were you?"
            />
            <IntegerSelect 
              label="Stress Level" 
              field="stres" 
              color="warning"
              description="How stressed or anxious did you feel?"
            />
          </div>
        </div>

        <div className="card p-6 space-y-6">
          <h3 className="text-xl font-bold text-text-primary flex items-center space-x-2">
            <MoonIcon className="h-6 w-6 text-purple-600" />
            <span>Health & Physical Metrics</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <NumberInput 
              label="Sleep Hours" 
              field="sleepavg" 
              placeholder="8.0" 
              unit="hrs" 
              icon={MoonIcon}
              description="How many hours did you sleep?"
              min={0}
              max={16}
              step={0.5}
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
              step={0.1}
            />
          </div>
        </div>

        <div className="card p-6 space-y-6">
          <h3 className="text-xl font-bold text-text-primary flex items-center space-x-2">
            <ScaleIcon className="h-6 w-6 text-orange-600" />
            <span>Diet & Substances</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        <div className="flex justify-center space-x-4 pt-6">
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
                  const currentDate = getCurrentDate()
                  setFormData({
                    date: currentDate,
                    subjectivesynchro: 3,
                    subjectivemood: 3,
                    productivity: 3,
                    statehealth: 3,
                    staterelationship: 3,
                    stateselfesteem: 3,
                    stateinteligence: 3,
                    statesocialskill: 3,
                    stateimmerse: 3,
                    stres: 3,
                    sleepavg: 8
                  })
                  setValidationErrors({})
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
  )
}