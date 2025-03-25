'use client';

import React, { useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaEye, FaEyeSlash } from 'react-icons/fa';
import Image from 'next/image';

interface BannersTabProps {
  banners: any[];
  handleAddBanner: () => void;
  handleEditBanner: (banner: any) => void;
  handleDeleteBanner: (bannerId: number) => void;
}

const BannersTab: React.FC<BannersTabProps> = ({ 
  banners, 
  handleAddBanner, 
  handleEditBanner, 
  handleDeleteBanner 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter banners
  const filteredBanners = banners.filter(banner => 
    banner.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    banner.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Confirm delete
  const confirmDelete = (bannerId: number) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      handleDeleteBanner(bannerId);
    }
  };

  // Toggle banner visibility (mock function)
  const toggleVisibility = (bannerId: number) => {
    console.log(`Toggle visibility for banner ${bannerId}`);
    // This would update the banner's visibility in a real app
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Banners ({banners.length})</h2>
        <button 
          onClick={handleAddBanner}
          className="glass px-4 py-2 rounded-md font-medium flex items-center hover:bg-gray-100 transition-colors"
        >
          <FaPlus className="mr-2" /> Add Banner
        </button>
      </div>
      
      {/* Search */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          className="glass pl-10 pr-4 py-2 w-full rounded-md"
          placeholder="Search banners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {filteredBanners.length > 0 ? (
          filteredBanners.map((banner) => (
            <div key={banner.id} className="glass rounded-xl overflow-hidden">
              <div className={`h-40 bg-gradient-to-r ${banner.color || 'from-purple-500 to-indigo-600'} relative`}>
                {banner.image && (
                  <div className="relative h-full w-full">
                    <Image 
                      src={banner.image} 
                      alt={banner.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 768px"
                      className="object-cover mix-blend-overlay opacity-50"
                    />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center p-6">
                  <div>
                    <h3 className="text-white text-xl font-bold">{banner.title}</h3>
                    <p className="text-white text-sm opacity-90">{banner.subtitle}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <span className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium">
                    {banner.buttonText || 'Shop Now'}
                  </span>
                  <span className="ml-2 text-sm opacity-70">
                    Links to: {banner.buttonLink || '/shop'}
                  </span>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => toggleVisibility(banner.id)}
                    className="text-gray-600 hover:text-black"
                    aria-label={banner.visible ? "Hide banner" : "Show banner"}
                  >
                    {banner.visible ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  <button 
                    onClick={() => handleEditBanner(banner)}
                    className="text-gray-600 hover:text-black"
                    aria-label="Edit banner"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => confirmDelete(banner.id)}
                    className="text-gray-600 hover:text-red-600"
                    aria-label="Delete banner"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No banners found matching your search
          </div>
        )}
      </div>
    </div>
  );
};

export default BannersTab;