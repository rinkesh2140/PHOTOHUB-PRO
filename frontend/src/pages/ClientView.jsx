// frontend/src/pages/ClientView.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/api';
import { Heart, Download, Share2, Calendar, MapPin, DollarSign } from 'lucide-react';

export const ClientView = () => {
  const { shareToken } = useParams();
  const [project, setProject] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedPhotos, setLikedPhotos] = useState(new Set());
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Generate unique client ID (for tracking likes)
  const clientId = useState(() => `client_${Date.now()}_${Math.random()}`)[0];

  useEffect(() => {
    fetchData();
  }, [shareToken]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectData, photosData] = await Promise.all([
        api.getPublicProject(shareToken),
        api.getPublicPhotos(shareToken)
      ]);
      setProject(projectData);
      setPhotos(photosData);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (photoId) => {
    try {
      const newLiked = new Set(likedPhotos);
      if (newLiked.has(photoId)) {
        newLiked.delete(photoId);
      } else {
        newLiked.add(photoId);
      }
      setLikedPhotos(newLiked);
      await api.likePhoto(photoId, clientId);
    } catch (error) {
      console.error('Error liking photo:', error);
    }
  };

  const handleDownload = (photoUrl, title) => {
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = `${title}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <p className="text-white text-lg">Loading your photos...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <p className="text-white text-lg">Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500">
            ProjectHub Pro
          </h1>
          <p className="text-slate-400 text-sm mt-1">Your curated photo gallery</p>
        </div>
      </header>

      {/* Project Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">{project.client_name}</h2>
          <p className="text-amber-400 text-lg font-semibold mb-6">{project.event_type}</p>

          <div className="grid grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-amber-400" />
              <div>
                <p className="text-slate-400 text-sm">Event Date</p>
                <p className="text-white font-semibold">
                  {new Date(project.event_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-amber-400" />
              <div>
                <p className="text-slate-400 text-sm">Location</p>
                <p className="text-white font-semibold">{project.location || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign size={20} className="text-amber-400" />
              <div>
                <p className="text-slate-400 text-sm">Investment</p>
                <p className="text-white font-semibold">₹{project.total_amount?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Photos Grid */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-6">
            Your Photos ({photos.length})
          </h3>

          {photos.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-slate-400">No photos in this gallery yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map(photo => (
                <div
                  key={photo.id}
                  className="group cursor-pointer relative rounded-lg overflow-hidden bg-slate-800 hover:shadow-xl hover:shadow-amber-400/20 transition-all"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  {/* Image */}
                  {photo.image_url && (
                    <img
                      src={photo.image_url}
                      alt={photo.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                    />
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(photo.id);
                      }}
                      className="p-2 bg-white rounded-full text-black hover:bg-slate-100 transition"
                    >
                      <Heart
                        size={20}
                        fill={likedPhotos.has(photo.id) ? 'currentColor' : 'none'}
                        className={likedPhotos.has(photo.id) ? 'text-red-500' : ''}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(photo.image_url, photo.title);
                      }}
                      className="p-2 bg-white rounded-full text-black hover:bg-slate-100 transition"
                    >
                      <Download size={20} />
                    </button>
                  </div>

                  {/* Badge */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                    <p className="text-white font-semibold text-sm truncate">{photo.title}</p>
                    <div className="flex gap-3 text-slate-300 text-xs mt-1">
                      <span>👁️ {photo.views}</span>
                      <span>❤️ {photo.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl w-full">
            <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700">
              {/* Modal Image */}
              <div className="bg-black h-96 flex items-center justify-center">
                {selectedPhoto.image_url && (
                  <img
                    src={selectedPhoto.image_url}
                    alt={selectedPhoto.title}
                    className="h-full w-full object-contain"
                  />
                )}
              </div>

              {/* Modal Info */}
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedPhoto.title}</h2>
                  <div className="flex gap-6 text-slate-400 text-sm mt-2">
                    <span>👁️ {selectedPhoto.views} views</span>
                    <span>❤️ {selectedPhoto.likes} likes</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleDownload(selectedPhoto.image_url, selectedPhoto.title);
                      setSelectedPhoto(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold py-3 rounded-lg transition"
                  >
                    <Download size={20} />
                    Download Full Size
                  </button>
                  <button
                    onClick={() => {
                      navigator.share({
                        title: selectedPhoto.title,
                        text: `Check out this photo from my gallery!`
                      }).catch(() => {
                        // Fallback: just copy link
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied!');
                      });
                    }}
                    className="flex-1 flex items-center justify-center gap-2 border border-slate-600 text-slate-300 font-bold py-3 rounded-lg hover:bg-slate-800 transition"
                  >
                    <Share2 size={20} />
                    Share
                  </button>
                  <button
                    onClick={() => handleLike(selectedPhoto.id)}
                    className={`px-6 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
                      likedPhotos.has(selectedPhoto.id)
                        ? 'bg-red-500 text-white'
                        : 'border border-slate-600 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Heart
                      size={20}
                      fill={likedPhotos.has(selectedPhoto.id) ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>

                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="w-full py-2 text-slate-400 hover:text-white transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
