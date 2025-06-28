'use client'

import { useState } from 'react'
import { SynchroData, insertSynchroData } from '../lib/supabase'
import { PlusIcon, CheckIcon } from '@heroicons/react/24/outline'

interface InputSectionProps {
  onDataUpdate: () => void
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await insertSynchroData(formData)
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
    step = 0.1 
  }: {
    label: string
    field: keyof SynchroData
    min?: number
    max?: number
    step?: number
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}: {formData[field] || 0}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={formData[field] as number || 0}
        onChange={(e) => handleChange(field, parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )

  const NumberInput = ({ 
    label, 
    field, 
    placeholder = '0' 
  }: {
    label: string
    field: keyof SynchroData
    placeholder?: string
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="number"
        step="0.1"
        placeholder={placeholder}
        value={formData[field] as number || ''}
        onChange={(e) => handleChange(field, e.target.value ? parseFloat(e.target.value) : null)}
        className="input-field"
      />
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="section-header">Add New Entry</h2>
        <p className="text-gray-600">
          Record your synchronicities and daily metrics
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Day of Week
                </label>
                <select
                  value={formData.day_of_the_week || ''}
                  onChange={(e) => handleChange('day_of_the_week', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>
            </div>
          </div>

          {/* Subjective Ratings */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Daily Ratings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <RangeInput 
                label="Synchronicity Level" 
                field="subjectiveSynchro" 
              />
              <RangeInput 
                label="Mood" 
                field="subjectiveMood" 
              />
              <RangeInput 
                label="Productivity" 
                field="productivity" 
              />
            </div>
          </div>

          {/* Synchronicity Times */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Synchronicity Times</h3>
            <p className="text-sm text-gray-600 mb-4">
              Record how many synchronicity events occurred at each time
            </p>
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {timeSlots.map(time => (
                <div key={time} className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700 text-center">
                    {time}
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData[time as keyof SynchroData] as number || ''}
                    onChange={(e) => handleChange(time as keyof SynchroData, e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cosmic-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Health & Sleep */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Health & Sleep</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <NumberInput label="Sleep Hours" field="sleepAvg" placeholder="8.0" />
              <NumberInput label="Heart Rate (Daily)" field="heartrateDaily" placeholder="70" />
              <NumberInput label="Heart Rate (Resting)" field="heartrateResting" placeholder="60" />
              <NumberInput label="Steps" field="stepsPhone" placeholder="10000" />
              <NumberInput label="Weight" field="weight" placeholder="70.0" />
              <RangeInput label="Stress Level" field="stres" />
            </div>
          </div>

          {/* Mental States */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Mental States</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <RangeInput label="Health State" field="stateHealth" />
              <RangeInput label="Relationship State" field="stateRelationship" />
              <RangeInput label="Self-esteem" field="stateSelfesteem" />
              <RangeInput label="Intelligence State" field="stateInteligence" />
              <RangeInput label="Social Skills" field="stateSocialSkill" />
              <RangeInput label="Immersion State" field="stateImmerse" />
            </div>
          </div>

          {/* Diet & Substances */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Diet & Substances</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <NumberInput label="Calories (kcal)" field="dietKcal" placeholder="2000" />
              <NumberInput label="Carbs (g)" field="dietCarbs" placeholder="200" />
              <NumberInput label="Protein (g)" field="dietProtein" placeholder="80" />
              <NumberInput label="Fats (g)" field="dietFats" placeholder="60" />
              <NumberInput label="Stimulants (mg)" field="stimMg" placeholder="0" />
              <NumberInput label="Alcohol" field="alcohol" placeholder="0" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            {success ? (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckIcon className="h-5 w-5" />
                <span>Entry saved successfully!</span>
              </div>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200
                  ${loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-cosmic-600 hover:bg-cosmic-700 text-white'
                  }
                `}
              >
                <PlusIcon className="h-5 w-5" />
                <span>{loading ? 'Saving...' : 'Save Entry'}</span>
              </button>
            )}
          </div>

          {error && (
            <div className="text-center text-red-600">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}