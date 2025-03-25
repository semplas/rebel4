'use client';

import React, { useState } from 'react';
import { FaSave, FaUpload, FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import { createBrowserClient } from '@/lib/supabase/client';

interface BannerFormProps {
  banner?: {
    id?: string;
    title: string;
    subtitle: string;
    image: string;
    buttonText: string;
    buttonLink: string;
    color: string;
    active: boolean;
  };
  onSave: (bannerData: any) => void;
  onCancel: () => void;
}

const BannerForm: React.FC<BannerFormProps> = ({ 
  banner, 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    title: banner?.title || '',
    subtitle: banner?.subtitle || '',
    image: banner?.image || '',
    buttonText: banner?.buttonText || 'Shop Now',
    buttonLink: banner?.buttonLink || '/shop',
    color: banner?.color || 'from-purple-500 to-indigo-600',
    active: banner?.active ?? true
  });
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(banner?.image || '');

  // Gradient options
  const gradientOptions = [
    'from-purple-500 to-indigo-600',
    'from-blue-500 to-teal-400',
    'from-red-500 to-orange-500',
    'from-green-500 to-emerald-400',
    'from-pink-500 to-rose-400',
    'from-gray-700 to-gray-900'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setUploading(true);
      setUploadError('');
      
      const file = files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.name}`);
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error(`File too large: ${file.name}`);
      }
      
      // Create URL preview
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      
      // Upload to Supabase Storage
      const supabase = createBrowserClient();
      const fileName = `banner-${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('images')  // Use 'images' bucket instead of 'banners'
        .upload(fileName, file);
        
      if (error) {
        console.error('Supabase storage error:', error);
        throw new Error(error.message || 'Error uploading to storage');
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('images')  // Use 'images' bucket instead of 'banners'
        .getPublicUrl(fileName);
      
      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }
        
      setFormData({
        ...formData,
        image: urlData.publicUrl
      });
      
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error uploading image';
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - Form fields */}
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Banner Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-1">
              Banner Subtitle
            </label>
            <input
              type="text"
              id="subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="buttonText" className="block text-sm font-medium text-gray-700 mb-1">
              Button Text
            </label>
            <input
              type="text"
              id="buttonText"
              name="buttonText"
              value={formData.buttonText}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="buttonLink" className="block text-sm font-medium text-gray-700 mb-1">
              Button Link
            </label>
            <input
              type="text"
              id="buttonLink"
              name="buttonLink"
              value={formData.buttonLink}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
              Background Gradient
            </label>
            <select
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              {gradientOptions.map((gradient, index) => (
                <option key={index} value={gradient}>
                  {gradient.replace('from-', '').replace('to-', ' to ').replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
              Active (Display on site)
            </label>
          </div>
        </div>
        
        {/* Right column - Image upload and preview */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banner Image
            </label>
            
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="relative w-full h-40 mb-4">
                    <Image 
                      src={imagePreview} 
                      alt="Banner preview" 
                      fill
                      className="object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setFormData({...formData, image: ''});
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <FaTimes size={14} />
                    </button>
                  </div>
                ) : (
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="image-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>{imagePreview ? 'Replace image' : 'Upload an image'}</span>
                    <input
                      id="image-upload"
                      name="image-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 2MB</p>
              </div>
            </div>
            
            {uploadError && (
              <p className="mt-2 text-sm text-red-600">{uploadError}</p>
            )}
            
            {uploading && (
              <p className="mt-2 text-sm text-indigo-600">Uploading...</p>
            )}
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preview
            </label>
            <div className={`h-40 rounded-lg overflow-hidden bg-gradient-to-r ${formData.color} relative`}>
              {imagePreview && (
                <div className="relative h-full w-full">
                  <Image 
                    src={imagePreview} 
                    alt="Banner preview" 
                    fill
                    className="object-cover mix-blend-overlay opacity-50"
                  />
                </div>
              )}
              <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-4">
                <h3 className="text-xl font-bold">{formData.title || 'Banner Title'}</h3>
                <p className="text-sm">{formData.subtitle || 'Banner subtitle text goes here'}</p>
                <button className="mt-2 px-4 py-1 bg-white text-gray-900 rounded-md text-sm">
                  {formData.buttonText || 'Shop Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <FaSave className="mr-2" />
          Save Banner
        </button>
      </div>
    </form>
  );
};

export default BannerForm;
