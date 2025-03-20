'use client';


import { useState } from 'react';
// import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaImage, FaUpload, FaSave } from 'react-icons/fa';
import Image from 'next/image';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null);

  // Mock data - in a real app, this would come from your database
  const [products, setProducts] = useState([
    { id: "1", name: "Rebel Classic Oxford", price: 249.99, image: "/images/1.png", category: "Formal", sold: 12 },
    { id: "2", name: "Urban Street Runner", price: 189.99, image: "/images/1.png", category: "Athletic", sold: 8 },
    { id: "3", name: "Awaknd Leather Boot", price: 299.99, image: "/images/1.png", category: "Boots", sold: 6 },
  ]);

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
    },
  ]);

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: 'Formal',
    description: '',
    images: ['', '', '', ''],
    features: ['', '', '']
  });

  // Banner form state
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    image: '',
    buttonText: '',
    buttonLink: '',
    color: 'from-blue-900 to-purple-900'
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      price: '',
      category: 'Formal',
      description: '',
      images: ['', '', '', ''],
      features: ['', '', '']
    });
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category || 'Formal',
      description: product.description || '',
      images: [product.image, '', '', ''],
      features: product.features || ['', '', '']
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

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

  const saveProduct = () => {
    const newProduct = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      name: productForm.name,
      price: parseFloat(productForm.price),
      image: productForm.images[0] || '/images/1.png',
      category: productForm.category,
      description: productForm.description,
      features: productForm.features.filter(f => f.trim() !== ''),
      additionalImages: productForm.images.slice(1).filter(img => img !== '')
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? newProduct : p));
    } else {
      setProducts([...products, newProduct]);
    }
    
    setShowProductModal(false);
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
    <div className="py-4 max-w-6xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Navigation Tabs */}
      <div className="flex border-b mb-8">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 font-medium ${activeTab === 'dashboard' ? 'border-b-2 border-black' : 'text-gray-500'}`}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-medium ${activeTab === 'products' ? 'border-b-2 border-black' : 'text-gray-500'}`}
        >
          Products
        </button>
        <button 
          onClick={() => setActiveTab('banners')}
          className={`px-4 py-2 font-medium ${activeTab === 'banners' ? 'border-b-2 border-black' : 'text-gray-500'}`}
        >
          Banners
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 font-medium ${activeTab === 'orders' ? 'border-b-2 border-black' : 'text-gray-500'}`}
        >
          Orders
        </button>
      </div>
      
      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white border rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-medium mb-3 text-gray-500 uppercase tracking-wider text-sm">Products</h3>
              <p className="text-4xl font-bold">{products.length}</p>
              <p className="text-green-500 mt-2 text-sm">+3 this week</p>
            </div>
            <div className="bg-white border rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-medium mb-3 text-gray-500 uppercase tracking-wider text-sm">Orders</h3>
              <p className="text-4xl font-bold">12</p>
              <p className="text-green-500 mt-2 text-sm">+2 today</p>
            </div>
            <div className="bg-white border rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-medium mb-3 text-gray-500 uppercase tracking-wider text-sm">Revenue</h3>
              <p className="text-4xl font-bold">£2,450</p>
              <p className="text-green-500 mt-2 text-sm">+15% this month</p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
              <div className="space-y-4">
                <button 
                  onClick={handleAddProduct}
                  className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
                >
                  <FaPlus className="mr-2" /> Add New Product
                </button>
                <button 
                  onClick={handleAddBanner}
                  className="w-full bg-white text-black py-3 rounded-md font-medium border border-black hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <FaImage className="mr-2" /> Add New Banner
                </button>
                <button className="w-full bg-white text-black py-3 rounded-md font-medium border border-black hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <FaUpload className="mr-2" /> Import Products
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold mb-6">Top Selling Products</h2>
              <ul className="space-y-4">
                {products.sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 3).map(product => (
                  <li key={product.id} className="flex justify-between items-center">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-gray-600">{product.sold || 0} sold</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Products</h2>
            <button 
              onClick={handleAddProduct}
              className="bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors flex items-center"
            >
              <FaPlus className="mr-2" /> Add Product
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-4">
                          <Image 
                            src={product.image} 
                            alt={product.name}
                            width={40}
                            height={40}
                            className="object-cover rounded"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">£{product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Banners Tab */}
      {activeTab === 'banners' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Banners</h2>
            <button 
              onClick={handleAddBanner}
              className="bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors flex items-center"
            >
              <FaPlus className="mr-2" /> Add Banner
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {banners.map(banner => (
              <div key={banner.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 h-48 relative">
                    <Image 
                      src={banner.image} 
                      alt={banner.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 md:w-2/3 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{banner.title}</h3>
                      <p className="text-gray-600 mb-4">{banner.subtitle}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">Button: {banner.buttonText}</span>
                        <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">Link: {banner.buttonLink}</span>
                        <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">Color: {banner.color}</span>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleEditBanner(banner)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Orders</h2>
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500">Order management functionality coming soon.</p>
          </div>
        </div>
      )}
      
      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input 
                    type="text" 
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (£)</label>
                  <input 
                    type="number" 
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  value={productForm.category}
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="Formal">Formal</option>
                  <option value="Casual">Casual</option>
                  <option value="Athletic">Athletic</option>
                  <option value="Boots">Boots</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  className="w-full border rounded-md px-3 py-2 h-24"
                  placeholder="Enter product description"
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (up to 4)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {productForm.images.map((image, index) => (
                    <div key={index} className="border rounded-md p-2">
                      <div className="h-32 bg-gray-100 mb-2 flex items-center justify-center relative">
                        {image ? (
                          <Image 
                            src={image} 
                            alt={`Product image ${index + 1}`}
                            fill
                            className="object-contain p-2"
                          />
                        ) : (
                          <FaImage className="text-gray-400 text-3xl" />
                        )}
                      </div>
                      <input 
                        type="text" 
                        value={image}
                        onChange={(e) => {
                          const newImages = [...productForm.images];
                          newImages[index] = e.target.value;
                          setProductForm({...productForm, images: newImages});
                        }}
                        className="w-full border rounded-md px-2 py-1 text-sm"
                        placeholder="Image URL"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Features</label>
                {productForm.features.map((feature, index) => (
                  <div key={index} className="mb-2">
                    <input 
                      type="text" 
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...productForm.features];
                        newFeatures[index] = e.target.value;
                        setProductForm({...productForm, features: newFeatures});
                      }}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder={`Feature ${index + 1}`}
                    />
                  </div>
                ))}
                <button 
                  onClick={() => setProductForm({...productForm, features: [...productForm.features, '']})}
                  className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center mt-2"
                >
                  <FaPlus className="mr-1" /> Add another feature
                </button>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4">
              <button 
                onClick={() => setShowProductModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={saveProduct}
                className="px-4 py-2 bg-black text-white rounded-md flex items-center"
              >
                <FaSave className="mr-2" /> Save Product
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Banner Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h2>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Enter banner title"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input 
                  type="text" 
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({...bannerForm, subtitle: e.target.value})}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Enter banner subtitle"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input 
                  type="text" 
                  value={bannerForm.image}
                  onChange={(e) => setBannerForm({...bannerForm, image: e.target.value})}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Enter image URL"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <input 
                    type="text" 
                    value={bannerForm.buttonText}
                    onChange={(e) => setBannerForm({...bannerForm, buttonText: e.target.value})}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Enter button text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                  <input 
                    type="text" 
                    value={bannerForm.buttonLink}
                    onChange={(e) => setBannerForm({...bannerForm, buttonLink: e.target.value})}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Enter button link"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Background Gradient</label>
                <select 
                  value={bannerForm.color}
                  onChange={(e) => setBannerForm({...bannerForm, color: e.target.value})}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="from-blue-900 to-purple-900">Blue to Purple</option>
                  <option value="from-gray-900 to-black">Gray to Black</option>
                  <option value="from-amber-700 to-red-800">Amber to Red</option>
                  <option value="from-green-800 to-teal-700">Green to Teal</option>
                  <option value="from-indigo-800 to-blue-700">Indigo to Blue</option>
                </select>
              </div>
              
              <div className="p-4 rounded-lg bg-gray-100">
                <h3 className="font-medium mb-2">Preview</h3>
                <div className={`bg-gradient-to-r ${bannerForm.color} h-32 rounded-lg relative overflow-hidden`}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white text-center">
                    <h3 className="text-xl font-bold">{bannerForm.title || 'Banner Title'}</h3>
                    <p className="text-sm mb-2">{bannerForm.subtitle || 'Banner subtitle text'}</p>
                    <button className="bg-white text-black px-4 py-1 rounded text-sm font-medium">
                      {bannerForm.buttonText || 'Button Text'}
                    </button>
                  </div>
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
          </div>
        </div>
      )}
    </div>
  );
}