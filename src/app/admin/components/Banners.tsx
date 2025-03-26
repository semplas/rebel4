'use client';

import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave } from 'react-icons/fa';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Banners() {
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  
  // Banner form state
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    image: '',
    buttonText: '',
    buttonLink: '',
    color: 'from-blue-900 to-purple-900'
  });
  
  // Sample banners data
  const [banners, setBanners] = useState([
    {
      id: 1,
      title: "Summer Collection",
      subtitle: "Lightweight styles for warmer days",
      image: "/images/1.png",
      buttonText: "Shop Now",
      buttonLink: "/shop?category=casual",
      color: "from-blue-900 to-purple-900"
    },
    {
      id: 2,
      title: "Formal Essentials",
      subtitle: "Elevate your professional wardrobe",
      image: "/images/1.png",
      buttonText: "Discover",
      buttonLink: "/shop?category=formal",
      color: "from-gray-900 to-black"
    }
  ]);

  const handleAddBanner = () => {
    setEditingBanner(null);
    setBannerForm({
      title: '',
      subtitle: '',
      image: '',
      buttonText: 'Shop Now',
      buttonLink: '/shop',
      color: 'from-blue-900 to-purple-900'
    });
    setShowBannerModal(true);
  };

  const handleEditBanner = (banner) => {
    setEditingBanner(banner);
    setBannerForm({
      title: banner.title,
      subtitle: banner.subtitle,
      image: banner.image,
      buttonText: banner.buttonText,
      buttonLink: banner.buttonLink,
      color: banner.color
    });
    setShowBannerModal(true);
  };

  const handleDeleteBanner = (bannerId) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      setBanners(banners.filter(b => b.id !== bannerId));
    }
  };

  const saveBanner = () => {
    const newBanner = {
      id: editingBanner ? editingBanner.id : Date.now(),
      ...bannerForm
    };

    if (editingBanner) {
      setBanners(banners.map(b => b.id === editingBanner.id ? newBanner : b));
    } else {
      setBanners([...banners, newBanner]);
    }
    
    setShowBannerModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Banners</h2>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddBanner}
          className="bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" /> Add Banner
        </motion.button>
      </div>
      
      {/* Banners Grid */}
      <div className="grid grid-cols-1 gap-6">
        {banners.map(banner => (
          <div key={banner.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className={`bg-gradient-to-r ${banner.color} h-32 relative`}>
              <div className="absolute inset-0 flex items-center p-6 text-white">
                <div>
                  <h3 className="text-xl font-bold">{banner.title}</h3>
                  <p>{banner.subtitle}</p>
                </div>
              </div>
              <div className="absolute top-2 right-2 flex space-x-2">
                <button 
                  onClick={() => handleEditBanner(banner)}
                  className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30"
                >
                  <FaEdit className="text-white" />
                </button>
                <button 
                  onClick={() => handleDeleteBanner(banner.id)}
                  className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30"
                >
                  <FaTrash className="text-white" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Button: {banner.buttonText}</p>
                  <p className="text-sm text-gray-500">Link: {banner.buttonLink}</p>
                </div>
                <div className="h-12 w-12 relative">
                  <Image 
                    src={banner.image} 
                    alt={banner.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Banner Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto"
          >
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input 
                    type="text" 
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Enter banner title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input 
                    type="text" 
                    value={bannerForm.subtitle}
                    onChange={(e) => setBannerForm({...bannerForm, subtitle: e.target.value})}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Enter banner subtitle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input 
                    type="text" 
                    value={bannerForm.image}
                    onChange={(e) => setBannerForm({...bannerForm, image: e.target.value})}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Enter image URL"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                    <input 
                      type="text" 
                      value={bannerForm.buttonText}
                      onChange={(e) => setBannerForm({...bannerForm, buttonText: e.target.value})}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="Shop Now"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                    <input 
                      type="text" 
                      value={bannerForm.buttonLink}
                      onChange={(e) => setBannerForm({...bannerForm, buttonLink: e.target.value})}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="/shop"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color Gradient</label>
                  <select
                    value={bannerForm.color}
                    onChange={(e) => setBannerForm({...bannerForm, color: e.target.value})}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="from-blue-900 to-purple-900">Blue to Purple</option>
                    <option value="from-gray-900 to-black">Gray to Black</option>
                    <option value="from-amber-700 to-red-800">Amber to Red</option>
                    <option value="from-green-800 to-teal-700">Green to Teal</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4">
              <button 
                onClick={() => setShowBannerModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={saveBanner}
                className="px-4 py-2 bg-black text-white rounded-md flex items-center"
              >
                <FaSave className="mr-2" /> Save Banner
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}