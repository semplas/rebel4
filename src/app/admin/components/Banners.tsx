'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave } from 'react-icons/fa';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const checkAndCreateBannersBucket = async () => {
    try {
      setLoading(true);
      // Check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'banners');
      
      if (!bucketExists) {
        // Create the bucket if it doesn't exist
        const { error } = await supabase.storage.createBucket('banners', {
          public: true, // Make bucket public
          fileSizeLimit: 1024 * 1024 * 5 // 5MB limit
        });
        
        if (error) throw error;
        console.log('Created banners bucket');
      }
      
      // Fetch banners after ensuring bucket exists
      await fetchBanners();
    } catch (err) {
      console.error('Error checking/creating banners bucket:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('priority', { ascending: false });
      
      if (error) throw error;
      
      setBanners(data || []);
    } catch (err) {
      console.error('Error fetching banners:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAndCreateBannersBucket();
  }, []);

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
      subtitle: banner.subtitle || '',
      image: banner.image,
      buttonText: banner.button_text || '',
      buttonLink: banner.button_link || '',
      color: banner.color || 'from-blue-900 to-purple-900'
    });
    setShowBannerModal(true);
  };

  const handleDeleteBanner = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Refresh the banners list
      await fetchBanners();
    } catch (err) {
      console.error('Error deleting banner:', err);
      alert('Failed to delete banner. Please try again.');
    }
  };

  const handleSubmitBanner = async (e) => {
    e.preventDefault();
    
    try {
      // Upload image if a new one is selected
      let imageUrl = bannerForm.image;
      
      if (selectedFile) {
        const uploadedUrl = await uploadBannerImage(selectedFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
      
      // Create the banner data object
      const bannerData = {
        title: bannerForm.title,
        subtitle: bannerForm.subtitle,
        image: imageUrl,
        button_text: bannerForm.buttonText,
        button_link: bannerForm.buttonLink,
        color: bannerForm.color,
        active: true,
        priority: 0
      };
      
      if (editingBanner) {
        // Update existing banner
        const { error } = await supabase
          .from('banners')
          .update(bannerData)
          .eq('id', editingBanner.id);
        
        if (error) throw error;
      } else {
        // Insert new banner
        const { error } = await supabase
          .from('banners')
          .insert(bannerData);
        
        if (error) throw error;
      }
      
      // Refresh the banners list
      await fetchBanners();
      setShowBannerModal(false);
      setSelectedFile(null);
    } catch (err) {
      console.error('Error saving banner:', err);
      alert('Failed to save banner. Please try again.');
    }
  };

  const uploadBannerImage = async (file) => {
    if (!file) return null;
    
    try {
      setUploadingImage(true);
      
      // Add file size check
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_FILE_SIZE) {
        alert(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        return null;
      }
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }
      
      // Get public URL
      const { data } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (err) {
      console.error('Error uploading banner image:', err);
      alert(`Failed to upload image: ${err.message || 'Unknown error'}`);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-amazon p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Banners</h2>
        <button
          onClick={handleAddBanner}
          className="amazon-button-primary flex items-center text-sm"
        >
          <FaPlus className="mr-2" /> Add Banner
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent-color border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading banners...</p>
        </div>
      ) : error ? (
        <div className="bg-danger-color/10 text-danger-color p-4 rounded-md">
          {error}
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12 bg-background-color rounded-md">
          <p className="text-gray-600">No banners found. Add your first banner to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Banners Grid */}
          <div className="grid grid-cols-1 gap-6">
            {banners.map(banner => (
              <div key={banner.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className={`bg-gradient-to-r ${banner.color} p-4 text-white`}>
                  <h3 className="text-xl font-bold">{banner.title}</h3>
                  <p className="text-sm opacity-80">{banner.subtitle}</p>
                </div>
                <div className="p-4">
                  <div className="aspect-[3/1] relative bg-gray-100 rounded-md overflow-hidden mb-3">
                    {banner.image ? (
                      <Image 
                        src={banner.image} 
                        alt={banner.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium">Button: </span>
                      <span className="text-sm text-gray-600">{banner.button_text || 'None'}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditBanner(banner)}
                        className="p-2 text-gray-600 hover:text-accent-color"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="p-2 text-gray-600 hover:text-danger-color"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Banner Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h2>
            <form onSubmit={handleSubmitBanner} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  name="title"
                  value={bannerForm.title} 
                  onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})}
                  className="amazon-input w-full" 
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
                <div className="flex items-center space-x-4">
                  <div className="relative h-20 w-32 bg-gray-100 rounded overflow-hidden">
                    {(selectedFile || bannerForm.image) && (
                      <img 
                        src={selectedFile ? URL.createObjectURL(selectedFile) : bannerForm.image} 
                        alt="Banner preview" 
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="banner-image"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                    <label 
                      htmlFor="banner-image" 
                      className="amazon-button-secondary text-sm cursor-pointer inline-block"
                    >
                      {uploadingImage ? 'Uploading...' : 'Choose Image'}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Recommended size: 1200x400px</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowBannerModal(false)}
                  className="amazon-button-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="amazon-button-primary"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'Uploading...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
