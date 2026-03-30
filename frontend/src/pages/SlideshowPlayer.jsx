import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function SlideshowPlayer() {
  const { slideshowId } = useParams()
  const navigate = useNavigate()
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch slideshow photos from API
    setPhotos([])
    setLoading(false)
  }, [slideshowId])

  useEffect(() => {
    if (!isPlaying || photos.length === 0) return

    const timer = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
    }, 3000)

    return () => clearInterval(timer)
  }, [isPlaying, photos.length])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No photos in slideshow</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const currentPhoto = photos[currentPhotoIndex]

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Photo Display */}
        <div className="mb-8">
          <img
            src={currentPhoto?.url || '/placeholder.jpg'}
            alt={`Photo ${currentPhotoIndex + 1}`}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            ← Previous
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          <button
            onClick={() => setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            Next →
          </button>
        </div>

        {/* Progress */}
        <div className="text-center">
          <p className="text-gray-400">
            Photo {currentPhotoIndex + 1} of {photos.length}
          </p>
          <div className="w-full bg-slate-700 rounded-full h-2 mt-4">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentPhotoIndex + 1) / photos.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
