import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CreateSlideshow() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    musicStyle: 'calm',
    durationPerPhoto: 3,
    transitionStyle: 'fade'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Call API to create slideshow
    console.log('Creating slideshow:', formData)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create Slideshow</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Slideshow Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-600"
              placeholder="My Slideshow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Music Style</label>
            <select
              name="musicStyle"
              value={formData.musicStyle}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-600"
            >
              <option value="calm">Calm</option>
              <option value="upbeat">Upbeat</option>
              <option value="dramatic">Dramatic</option>
              <option value="romantic">Romantic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration Per Photo (seconds)</label>
            <input
              type="number"
              name="durationPerPhoto"
              value={formData.durationPerPhoto}
              onChange={handleChange}
              min="1"
              max="10"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Transition Style</label>
            <select
              name="transitionStyle"
              value={formData.transitionStyle}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-600"
            >
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
              <option value="zoom">Zoom</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Create Slideshow
          </button>
        </form>
      </div>
    </div>
  )
}
