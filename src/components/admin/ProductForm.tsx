'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FaSave, FaUpload, FaTrash, FaTimes, FaPlus, FaRobot, FaChevronDown, FaChevronUp, FaSearch, FaCheck, FaExclamationTriangle, FaCheckCircle, FaExclamationCircle, FaCircle, FaChartBar, FaLightbulb, FaMagic 
} from 'react-icons/fa';
import { MdOutlineAnalytics } from 'react-icons/md';
import Image from 'next/image';
import { uploadProductImage } from '@/lib/products';
import { Product } from '@/types/product';
import { createBrowserClient } from '@/lib/supabase/client';

interface ProductFormProps {
  product?: Partial<Product>;
  onSave: (productData: any) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  product, 
  onSave, 
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Formal',
    price: '',
    description: '',
    stock: '',
    features: [''],
    images: [] as string[],  // Ensure this is initialized as an empty array
    image: '/images/1.png',
    color: '',
    isNew: false,
    type: 'shoe'
  });
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [seoExpanded, setSeoExpanded] = useState(false);
  const [seoData, setSeoData] = useState({
    metaTitle: '',
    metaDescription: '',
    urlSlug: '',
    focusKeywords: [''],
    imageAltText: ''
  });
  const [seoScores, setSeoScores] = useState({
    title: 'neutral',
    description: 'neutral',
    slug: 'neutral',
    keywords: 'neutral',
    overall: 'neutral' // Add overall score
  });
  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);
  const [generatingKeywords, setGeneratingKeywords] = useState(false);
  const [seoAnalysis, setSeoAnalysis] = useState({
    contentAnalysis: { score: 'neutral', suggestions: [] },
    keywordDensity: { score: 'neutral', value: 0, suggestions: [] },
    readability: { score: 'neutral', value: 0, suggestions: [] }
  });
  const [competitorKeywords, setCompetitorKeywords] = useState([]);
  const [showAdvancedSeo, setShowAdvancedSeo] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState({
    title: '',
    description: '',
    keywords: [],
    altText: ''
  });
  const [generatingSuggestion, setGeneratingSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Categories available in the store
  const categories = [
    'Formal',
    'Casual',
    'Sports',
    'Outdoor',
    'Accessories',
    'Sale'
  ];

  // Add product types
  const productTypes = [
    'shoe',
    'material'
  ];

  useEffect(() => {
    if (product) {
      // Convert features array to string array if it's not already
      const features = Array.isArray(product.features) 
        ? product.features 
        : product.features 
          ? JSON.parse(product.features as unknown as string) 
          : [''];
      
      // Ensure images is an array
      let images = [];
      if (product.images) {
        if (Array.isArray(product.images)) {
          images = product.images;
        } else if (typeof product.images === 'string') {
          try {
            images = JSON.parse(product.images);
          } catch (e) {
            console.error('Failed to parse images string:', e);
            // If it's a single image URL string, make it an array
            if (typeof product.images === 'string' && product.images.startsWith('http')) {
              images = [product.images];
            }
          }
        }
      }
      
      setFormData({
        name: product.name || '',
        category: product.category || 'Formal',
        price: product.price ? String(product.price) : '',
        description: product.description || '',
        stock: product.stock ? String(product.stock) : '',
        features: features.length ? features : [''],
        images: images,
        image: product.image || '/images/1.png',
        color: product.color || '',
        isNew: product.isNew || false,
        type: product.type || 'shoe'
      });
      
      setImagePreview(product.image || '');
      
      // Debug
      console.log('Product images:', product.images);
      console.log('Parsed images:', images);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: updatedFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, features: updatedFeatures.length ? updatedFeatures : [''] }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log('Files selected:', files?.length, files);
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the 3 image limit
    if ((formData.images?.length || 0) + files.length > 3) {
      setUploadError('Maximum 3 images allowed');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');
      setUploadProgress(0);
      
      // Create previews immediately for better UX
      Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (index === 0 && !imagePreview) {
            setImagePreview(e.target?.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
      
      // Process each file
      const totalFiles = files.length;
      let completedFiles = 0;
      
      const uploadPromises = Array.from(files).map(async (file) => {
        console.log('Processing file:', file.name, file.type, file.size);
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          throw new Error(`Invalid file type: ${file.name}`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File too large: ${file.name}`);
        }
        
        // Upload to storage - ensure we're using the imported function
        const url = await uploadProductImage(file);
        
        // Update progress
        completedFiles++;
        setUploadProgress(Math.round((completedFiles / totalFiles) * 100));
        
        return url;
      });
      
      // Wait for all uploads to complete
      const uploadedUrls = await Promise.all(uploadPromises);
      console.log('Uploaded URLs:', uploadedUrls);
      
      // Update form data with new images
      setFormData(prev => {
        // Add to images array if not already there
        const newImages = [...(prev.images || [])];
        
        uploadedUrls.forEach(url => {
          if (!newImages.includes(url)) {
            newImages.push(url);
          }
        });
        
        // If this is the first image or we're using a placeholder, set it as main image
        const newMainImage = prev.image === '/images/placeholder.png' || !prev.images?.length 
          ? uploadedUrls[0] 
          : prev.image;
        
        return { 
          ...prev, 
          image: newMainImage,
          images: newImages
        };
      });
      
      setUploading(false);
      setUploadProgress(0);
      setUploadError('');
    } catch (error: any) {
      console.error('Error uploading images:', error);
      setUploadError(error.message || 'Failed to upload images');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const setMainImage = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image: imageUrl }));
    setImagePreview(imageUrl);
  };

  const removeImage = (imageUrl: string) => {
    const updatedImages = formData.images.filter(img => img !== imageUrl);
    
    // If we're removing the main image, set a new one
    let mainImage = formData.image;
    if (imageUrl === formData.image) {
      mainImage = updatedImages.length > 0 ? updatedImages[0] : '/images/1.png';
      setImagePreview(mainImage);
    }
    
    setFormData(prev => ({ 
      ...prev, 
      images: updatedImages,
      image: mainImage
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    // Validate required fields
    if (!formData.name?.trim()) {
      setUploadError('Product name is required');
      return;
    }
    
    if (!formData.price) {
      setUploadError('Price is required');
      return;
    }
    
    // Validate images
    if (!formData.image || formData.image === '/images/placeholder.png') {
      setUploadError('Please upload at least one product image');
      return;
    }
    
    // Parse numeric values
    const priceValue = typeof formData.price === 'string' ? 
      parseFloat(formData.price) : formData.price;
      
    if (isNaN(priceValue) || priceValue <= 0) {
      setUploadError('Please enter a valid price');
      return;
    }
    
    const stockValue = typeof formData.stock === 'string' ? 
      parseInt(formData.stock) : (formData.stock || 0);
    
    // Convert string values to appropriate types
    const processedData = {
      ...formData,
      price: priceValue,
      stock: stockValue,
      features: formData.features?.filter(f => f.trim() !== '') || [],
      // Ensure all required fields are present
      name: formData.name.trim(),
      category: formData.category.trim(),
      description: formData.description || '',
      image: formData.image,
      images: formData.images || [],
      isNew: formData.isNew || false,
      type: formData.type || 'shoe',
    };
    
    // Set submitting state to true before saving
    setIsSubmitting(true);
    
    console.log('Submitting product data:', processedData);
    
    // Call onSave and handle the promise to reset isSubmitting state
    onSave(processedData)
      .then(() => {
        console.log('Product saved successfully');
      })
      .catch(error => {
        console.error('Error saving product:', error);
        setUploadError(error.message || 'Failed to save product');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const generateProductDescription = () => {
    // Get relevant form data
    const { name, category, price, color, features, type } = formData;
    
    // Skip if essential details are missing
    if (!name || !category) {
      setUploadError('Please fill in product name and category before generating a description');
      return;
    }
    
    setGeneratingDescription(true);
    
    try {
      // Create a base description template based on product type and category
      let description = '';
      
      // Product type specific intro
      if (type === 'shoe') {
        description = `Introducing the ${name}, a premium ${category.toLowerCase()} shoe`;
        if (color) description += ` in a sophisticated ${color.toLowerCase()} finish`;
        description += `. `;
      } else if (type === 'material') {
        description = `Premium ${name}, a high-quality ${category.toLowerCase()} material`;
        if (color) description += ` in elegant ${color.toLowerCase()}`;
        description += `. `;
      } else {
        description = `Discover the ${name}, a premium ${category.toLowerCase()} product`;
        if (color) description += ` in ${color.toLowerCase()}`;
        description += `. `;
      }
      
      // Add price positioning
      if (price) {
        const priceNum = parseFloat(price.toString());
        if (priceNum > 200) {
          description += `This luxury item represents the pinnacle of craftsmanship and design. `;
        } else if (priceNum > 100) {
          description += `Offering exceptional quality at a premium value. `;
        } else {
          description += `Providing excellent value without compromising on quality. `;
        }
      }
      
      // Add features highlight
      if (features && features.length > 0 && features[0] !== '') {
        description += `Featuring `;
        const validFeatures = features.filter(f => f.trim() !== '');
        
        if (validFeatures.length === 1) {
          description += `${validFeatures[0].toLowerCase()}. `;
        } else if (validFeatures.length === 2) {
          description += `${validFeatures[0].toLowerCase()} and ${validFeatures[1].toLowerCase()}. `;
        } else if (validFeatures.length > 2) {
          const lastFeature = validFeatures.pop();
          description += `${validFeatures.map(f => f.toLowerCase()).join(', ')}, and ${lastFeature?.toLowerCase()}. `;
        }
      }
      
      // Add category-specific closing
      if (category === 'Formal') {
        description += `Perfect for business meetings, special occasions, or any event that calls for sophisticated style.`;
      } else if (category === 'Casual') {
        description += `Ideal for everyday wear, offering both comfort and style for your daily activities.`;
      } else if (category === 'Sports') {
        description += `Designed for performance and durability, helping you achieve your best during athletic activities.`;
      } else if (category === 'Outdoor') {
        description += `Built to withstand the elements while keeping you comfortable during your outdoor adventures.`;
      } else {
        description += `A must-have addition to your collection, combining style, quality, and exceptional craftsmanship.`;
      }
      
      // Update form data with generated description
      setFormData(prev => ({ ...prev, description }));
      
    } catch (error) {
      console.error('Error generating description:', error);
      setUploadError('Failed to generate description. Please try again.');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const generateMetaTitle = (name, category) => {
    if (!name) return '';
    const brandName = 'Awaknd Rebel';
    // Keep title under 60 characters
    const baseTitle = `${name} - Premium ${category} Footwear`;
    return baseTitle.length > 52 ? `${baseTitle.substring(0, 49)}... | ${brandName}` : `${baseTitle} | ${brandName}`;
  };

  const generateMetaDescription = (description) => {
    if (!description) return '';
    // Keep description under 160 characters
    return description.length > 157 
      ? `${description.substring(0, 157)}...` 
      : description;
  };

  const generateSlug = (name) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  const handleSeoChange = (e) => {
    const { name, value } = e.target;
    setSeoData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update SEO scores
    updateSeoScores(name, value);
  };

  const handleKeywordChange = (index, value) => {
    const updatedKeywords = [...seoData.focusKeywords];
    updatedKeywords[index] = value;
    setSeoData(prev => ({
      ...prev,
      focusKeywords: updatedKeywords
    }));
    
    updateSeoScores('keywords', updatedKeywords);
  };

  const addKeyword = () => {
    setSeoData(prev => ({
      ...prev,
      focusKeywords: [...prev.focusKeywords, '']
    }));
  };

  const removeKeyword = (index) => {
    const updatedKeywords = [...seoData.focusKeywords];
    updatedKeywords.splice(index, 1);
    setSeoData(prev => ({
      ...prev,
      focusKeywords: updatedKeywords
    }));
    
    updateSeoScores('keywords', updatedKeywords);
  };

  const updateSeoScores = (field, value) => {
    setSeoScores(prev => {
      const newScores = { ...prev };
      
      switch (field) {
        case 'metaTitle':
          if (!value) newScores.title = 'neutral';
          else if (value.length < 30) newScores.title = 'poor';
          else if (value.length > 60) newScores.title = 'poor';
          else newScores.title = 'good';
          break;
        
        case 'metaDescription':
          if (!value) newScores.description = 'neutral';
          else if (value.length < 80) newScores.description = 'poor';
          else if (value.length > 160) newScores.description = 'poor';
          else newScores.description = 'good';
          break;
        
        case 'urlSlug':
          if (!value) newScores.slug = 'neutral';
          else if (value.length > 50) newScores.slug = 'poor';
          else newScores.slug = 'good';
          break;
        
        case 'keywords':
          if (!value || (Array.isArray(value) && (!value.length || !value[0]))) {
            newScores.keywords = 'neutral';
          } else if (Array.isArray(value) && value.filter(k => k.trim()).length >= 1) {
            newScores.keywords = 'good';
          } else {
            newScores.keywords = 'poor';
          }
          break;
      }
      
      // Calculate overall score
      const scores = [newScores.title, newScores.description, newScores.slug, newScores.keywords];
      const goodCount = scores.filter(s => s === 'good').length;
      const poorCount = scores.filter(s => s === 'poor').length;
      const neutralCount = scores.filter(s => s === 'neutral').length;
      
      if (neutralCount === 4) {
        newScores.overall = 'neutral';
      } else if (goodCount >= 3) {
        newScores.overall = 'excellent';
      } else if (goodCount >= 2) {
        newScores.overall = 'good';
      } else if (poorCount >= 3) {
        newScores.overall = 'poor';
      } else {
        newScores.overall = 'average';
      }
      
      return newScores;
    });
  };

  const generateKeywordSuggestions = () => {
    // Get relevant form data
    const { name, category, type, color } = formData;
    
    if (!name || !category) {
      setUploadError('Please fill in product name and category before generating keywords');
      return;
    }
    
    setGeneratingKeywords(true);
    
    try {
      // Generate keywords based on product data
      const baseKeywords = [category, type || 'shoe'];
      
      // Add color if available
      if (color) baseKeywords.push(color);
      
      // Add product name parts (split by spaces)
      const nameParts = name.split(' ').filter(part => part.length > 2);
      baseKeywords.push(...nameParts);
      
      // Add combinations
      const combinations = [];
      if (color) {
        combinations.push(`${color} ${category}`);
        combinations.push(`${color} ${type || 'shoe'}`);
      }
      
      combinations.push(`${category} ${type || 'shoe'}`);
      
      // Combine all suggestions and remove duplicates
      const allSuggestions = [...new Set([...baseKeywords, ...combinations])];
      
      // Filter out any empty strings and limit to 10 suggestions
      setKeywordSuggestions(
        allSuggestions
          .filter(k => k.trim() !== '')
          .slice(0, 10)
      );
    } catch (error) {
      console.error('Error generating keywords:', error);
      setUploadError('Failed to generate keywords. Please try again.');
    } finally {
      setGeneratingKeywords(false);
    }
  };

  const addSuggestedKeyword = (keyword: string) => {
    // Don't add if it already exists
    if (seoData.focusKeywords.includes(keyword)) return;
    
    setSeoData(prev => ({
      ...prev,
      focusKeywords: [...prev.focusKeywords, keyword]
    }));
    
    updateSeoScores('keywords', [...seoData.focusKeywords, keyword]);
  };

  useEffect(() => {
    if (product) {
      // Initialize from existing product data if available
      setSeoData({
        metaTitle: product.metaTitle || generateMetaTitle(product.name, product.category),
        metaDescription: product.metaDescription || generateMetaDescription(product.description),
        urlSlug: product.urlSlug || generateSlug(product.name),
        focusKeywords: product.focusKeywords || [product.category || ''],
        imageAltText: product.imageAltText || `${product.name} - ${product.category} product image`
      });
    } else if (formData.name) {
      // Generate from current form data
      setSeoData(prev => ({
        ...prev,
        metaTitle: generateMetaTitle(formData.name, formData.category),
        urlSlug: generateSlug(formData.name),
        imageAltText: `${formData.name} - ${formData.category} product image`
      }));
    }
  }, [product, formData.name, formData.category]);

  // Helper function to get score color
  const getScoreColor = (score) => {
    switch (score) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-green-500';
      case 'average': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  // Helper function to get score icon
  const getScoreIcon = (score) => {
    switch (score) {
      case 'excellent': return <FaCheckCircle className="mr-1" />;
      case 'good': return <FaCheck className="mr-1" />;
      case 'average': return <FaExclamationCircle className="mr-1" />;
      case 'poor': return <FaExclamationTriangle className="mr-1" />;
      default: return <FaCircle className="mr-1" />;
    }
  };

  const analyzeSeoContent = () => {
    const { name, description } = formData;
    const mainKeyword = seoData.focusKeywords[0] || '';
    
    if (!description || !mainKeyword) return;
    
    // Content length analysis
    const contentLength = description.length;
    let contentScore = 'poor';
    const contentSuggestions = [];
    
    if (contentLength < 300) {
      contentSuggestions.push('Add more content (aim for 300+ characters)');
    } else if (contentLength > 300) {
      contentScore = 'good';
    }
    
    // Keyword density analysis
    const keywordRegex = new RegExp(mainKeyword, 'gi');
    const keywordMatches = description.match(keywordRegex) || [];
    const keywordDensity = (keywordMatches.length / (description.split(' ').length || 1)) * 100;
    
    let keywordScore = 'poor';
    const keywordSuggestions = [];
    
    if (keywordDensity < 0.5) {
      keywordSuggestions.push('Increase main keyword usage (aim for 1-2%)');
    } else if (keywordDensity > 5) {
      keywordScore = 'poor';
      keywordSuggestions.push('Reduce keyword density (currently over 5%)');
    } else {
      keywordScore = 'good';
    }
    
    // Basic readability score (simplified Flesch-Kincaid)
    const sentences = description.split(/[.!?]+/).length;
    const words = description.split(/\s+/).length;
    const avgWordsPerSentence = words / (sentences || 1);
    
    let readabilityScore = 'neutral';
    const readabilitySuggestions = [];
    
    if (avgWordsPerSentence > 20) {
      readabilityScore = 'poor';
      readabilitySuggestions.push('Use shorter sentences for better readability');
    } else if (avgWordsPerSentence < 5 && sentences > 1) {
      readabilityScore = 'poor';
      readabilitySuggestions.push('Sentences are very short, consider adding more detail');
    } else {
      readabilityScore = 'good';
    }
    
    setSeoAnalysis({
      contentAnalysis: { 
        score: contentScore, 
        suggestions: contentSuggestions 
      },
      keywordDensity: { 
        score: keywordScore, 
        value: parseFloat(keywordDensity.toFixed(1)), 
        suggestions: keywordSuggestions 
      },
      readability: { 
        score: readabilityScore, 
        value: parseFloat(avgWordsPerSentence.toFixed(1)), 
        suggestions: readabilitySuggestions 
      }
    });
  };

  const suggestCompetitorKeywords = () => {
    const { category, type } = formData;
    
    if (!category) return;
    
    // Simulate competitor keyword analysis with predefined keywords by category
    const competitorKeywordMap = {
      'sneakers': ['comfortable sneakers', 'athletic footwear', 'casual shoes', 'running shoes', 'trendy sneakers'],
      'boots': ['leather boots', 'winter boots', 'waterproof boots', 'hiking boots', 'fashion boots'],
      'sandals': ['summer sandals', 'beach footwear', 'comfortable sandals', 'walking sandals', 'fashion sandals'],
      'athletic': ['performance shoes', 'sports footwear', 'training shoes', 'gym shoes', 'athletic footwear'],
      'casual': ['everyday shoes', 'comfortable footwear', 'casual style', 'walking shoes', 'daily wear'],
      'formal': ['dress shoes', 'business footwear', 'formal occasions', 'professional shoes', 'elegant footwear']
    };
    
    // Get keywords for the category or use default set
    const keywords = competitorKeywordMap[category.toLowerCase()] || 
                    competitorKeywordMap[type?.toLowerCase()] || 
                    ['quality footwear', 'comfortable shoes', 'stylish shoes', 'durable footwear', 'premium shoes'];
    
    setCompetitorKeywords(keywords);
  };

  useEffect(() => {
    if (formData.description && seoData.focusKeywords[0]) {
      analyzeSeoContent();
    }
    
    if (formData.category) {
      suggestCompetitorKeywords();
    }
  }, [formData.description, seoData.focusKeywords[0], formData.category]);

  const generateAiSuggestion = (field) => {
    setGeneratingSuggestion(field);
    
    // Simulate AI generation with timeout
    setTimeout(() => {
      const { name, description, category, type, color } = formData;
      
      switch(field) {
        case 'title':
          setAiSuggestions(prev => ({
            ...prev,
            title: `${name || 'Product'} | ${category || 'Category'} ${type || 'Footwear'} | Awaknd Rebel`
          }));
          break;
        case 'description':
          if (description) {
            // Create a more concise version focused on benefits
            const words = description.split(' ');
            const shortDesc = words.length > 30 
              ? words.slice(0, 30).join(' ') + '...'
              : description;
            setAiSuggestions(prev => ({
              ...prev,
              description: `Discover our ${category?.toLowerCase() || ''} ${name || 'product'}: ${shortDesc}`
            }));
          } else {
            setAiSuggestions(prev => ({
              ...prev,
              description: `Experience premium quality with our ${color || ''} ${category?.toLowerCase() || ''} ${type || 'footwear'} designed for comfort and style.`
            }));
          }
          break;
        case 'keywords':
          // Generate keywords based on product attributes
          const baseKeywords = [];
          if (category) baseKeywords.push(category.toLowerCase());
          if (type) baseKeywords.push(type.toLowerCase());
          if (color) baseKeywords.push(`${color} ${category?.toLowerCase() || 'footwear'}`);
          
          // Add some specific keywords based on category
          if (category?.toLowerCase() === 'formal') {
            baseKeywords.push('business shoes', 'dress footwear', 'professional attire');
          } else if (category?.toLowerCase() === 'casual') {
            baseKeywords.push('everyday shoes', 'comfortable footwear', 'relaxed style');
          } else if (category?.toLowerCase() === 'sports') {
            baseKeywords.push('athletic footwear', 'performance shoes', 'sports gear');
          }
          
          setAiSuggestions(prev => ({
            ...prev,
            keywords: baseKeywords.slice(0, 5)
          }));
          break;
        case 'altText':
          setAiSuggestions(prev => ({
            ...prev,
            altText: `${color || ''} ${name || 'Product'} - ${category || 'Footwear'} by Awaknd Rebel, ${type || 'shoe'} front view`
          }));
          break;
        default:
          break;
      }
      
      setGeneratingSuggestion('');
    }, 1500);
  };

  const applyAiSuggestion = (field) => {
    switch(field) {
      case 'title':
        setSeoData(prev => ({ ...prev, metaTitle: aiSuggestions.title }));
        updateSeoScores('title', aiSuggestions.title);
        break;
      case 'description':
        setSeoData(prev => ({ ...prev, metaDescription: aiSuggestions.description }));
        updateSeoScores('description', aiSuggestions.description);
        break;
      case 'keywords':
        setSeoData(prev => ({ ...prev, focusKeywords: aiSuggestions.keywords }));
        updateSeoScores('keywords', aiSuggestions.keywords);
        break;
      case 'altText':
        setSeoData(prev => ({ ...prev, imageAltText: aiSuggestions.altText }));
        break;
      default:
        break;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {uploadError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {uploadError}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price ($) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          {/* Stock */}
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
              Stock *
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          {/* Color */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700">
              Color
            </label>
            <input
              type="text"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Is New Product */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isNew"
              name="isNew"
              checked={formData.isNew}
              onChange={handleChange}
              className="rounded mr-2"
            />
            <label htmlFor="isNew" className="text-sm font-medium">Mark as New Product</label>
          </div>
        </div>
        
        {/* Right column */}
        <div className="space-y-6">
          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <button
                type="button"
                onClick={generateProductDescription}
                disabled={generatingDescription}
                className="text-sm flex items-center gap-1 text-purple-600 hover:text-purple-800 disabled:text-gray-400"
              >
                <FaRobot className="text-sm" />
                {generatingDescription ? 'Generating...' : 'Generate Description'}
              </button>
            </div>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {generatingDescription && (
              <div className="mt-1 text-xs text-gray-500 animate-pulse">
                Creating product description...
              </div>
            )}
          </div>
          
          {/* Product Image */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Product Image
            </label>
            <div className="mt-1 flex items-center space-x-4">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Product Image"
                  width={100}
                  height={100}
                  className="h-24 w-24 object-cover rounded"
                />
              ) : (
                <div className="h-24 w-24 bg-gray-100 rounded flex items-center justify-center">
                  <FaUpload className="text-gray-400" />
                </div>
              )}
              <div>
                <label htmlFor="imageUpload" className="glass px-4 py-2 rounded-md font-medium cursor-pointer">
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </label>
                <input
                  type="file"
                  id="imageUpload"
                  name="image"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                />
              </div>
            </div>
          </div>
          
          {/* Product Features */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Product Features</label>
              <button
                type="button"
                onClick={addFeature}
                className="text-sm text-purple-600 hover:text-purple-800"
              >
                + Add Feature
              </button>
            </div>
            
            {formData.features.map((feature, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter product feature"
                />
                {formData.features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Product Images Gallery */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Product Images</h3>
        
        {/* Image preview and upload */}
        <div className="mb-4">
          <div className="flex items-start gap-4">
            <div className="relative h-32 w-32 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Product preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full">
                  <FaUpload className="text-gray-300 text-2xl" />
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <label 
                htmlFor="imageUpload" 
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors"
              >
                <FaUpload className="mr-2 -ml-1 h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload Images'}
              </label>
              <input
                type="file"
                id="imageUpload"
                name="image"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
                accept="image/jpeg,image/png,image/webp"
                multiple
              />
              <p className="text-xs text-gray-500">
                Max 3 images, 5MB each (JPEG, PNG, WebP)
              </p>
            </div>
          </div>
        </div>
        
        {/* Image gallery */}
        {formData.images && Array.isArray(formData.images) && formData.images.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Product Gallery ({formData.images.length}/3)
              </label>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group">
                  <div className={`h-24 w-full bg-white rounded-lg border overflow-hidden ${img === formData.image ? 'ring-2 ring-blue-500' : ''}`}>
                    <Image 
                      src={img} 
                      alt={`Product image ${index + 1}`} 
                      width={100}
                      height={100}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setMainImage(img)}
                      className="p-1 bg-blue-500 text-white rounded-full mr-1 hover:bg-blue-600 transition-colors"
                      title="Set as main image"
                    >
                      <FaPlus size={10} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(img)}
                      className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <FaTrash size={10} />
                    </button>
                  </div>
                  {img === formData.image && (
                    <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                      Main
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {uploadError && (
          <div className="mt-2 text-sm text-red-600">
            {uploadError}
          </div>
        )}
      </div>
      
      {/* SEO Section */}
      <div className="mt-8 border rounded-lg overflow-hidden">
        <button
          type="button"
          className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          onClick={() => setSeoExpanded(!seoExpanded)}
        >
          <div className="flex items-center">
            <FaSearch className="mr-2 text-gray-600" />
            <span className="font-medium">Search Engine Optimization (SEO)</span>
          </div>
          {seoExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        
        {seoExpanded && (
          <div className="p-4 space-y-4">
            {/* Overall SEO Score */}
            <div className="mb-6 border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-3 border-b">
                <h3 className="font-medium">Overall SEO Score</h3>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`text-2xl font-bold ${getScoreColor(seoScores.overall)} flex items-center`}>
                      {getScoreIcon(seoScores.overall)}
                      {seoScores.overall === 'neutral' ? 'Not Rated' : seoScores.overall.charAt(0).toUpperCase() + seoScores.overall.slice(1)}
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    {['title', 'description', 'slug', 'keywords'].map((field) => (
                      <div 
                        key={field}
                        className={`w-3 h-3 rounded-full ${
                          seoScores[field] === 'good' ? 'bg-green-500' : 
                          seoScores[field] === 'poor' ? 'bg-red-500' : 
                          'bg-gray-300'
                        }`}
                        title={`${field.charAt(0).toUpperCase() + field.slice(1)}: ${seoScores[field]}`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="mt-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`flex items-center ${getScoreColor(seoScores.title)}`}>
                      {getScoreIcon(seoScores.title)} Title
                    </div>
                    <div className={`flex items-center ${getScoreColor(seoScores.description)}`}>
                      {getScoreIcon(seoScores.description)} Description
                    </div>
                    <div className={`flex items-center ${getScoreColor(seoScores.slug)}`}>
                      {getScoreIcon(seoScores.slug)} URL Slug
                    </div>
                    <div className={`flex items-center ${getScoreColor(seoScores.keywords)}`}>
                      {getScoreIcon(seoScores.keywords)} Keywords
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Optimize your product for search engines to improve visibility and attract more customers.
            </p>
            
            {/* Meta Title with AI suggestion */}
            <div>
              <div className="flex justify-between">
                <label className="block text-sm font-medium mb-1">Meta Title</label>
                <div className="flex items-center">
                  <span className={`text-xs mr-2 ${
                    seoData.metaTitle.length > 60 ? 'text-red-500' : 
                    seoData.metaTitle.length > 50 ? 'text-yellow-500' : 'text-gray-500'
                  }`}>
                    {seoData.metaTitle.length}/60 characters
                  </span>
                  <button
                    type="button"
                    onClick={() => generateAiSuggestion('title')}
                    disabled={generatingSuggestion === 'title'}
                    className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-800 disabled:text-gray-400"
                  >
                    <FaMagic className="text-xs" />
                    {generatingSuggestion === 'title' ? 'Generating...' : 'AI Suggest'}
                  </button>
                </div>
              </div>
              <input
                type="text"
                name="metaTitle"
                value={seoData.metaTitle}
                onChange={handleSeoChange}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Enter meta title (50-60 characters recommended)"
              />
              {aiSuggestions.title && (
                <div className="mt-1 text-xs border border-purple-200 bg-purple-50 p-2 rounded">
                  <div className="flex justify-between">
                    <span className="font-medium text-purple-700">AI Suggestion:</span>
                    <button
                      type="button"
                      onClick={() => applyAiSuggestion('title')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-gray-700 mt-1">{aiSuggestions.title}</p>
                </div>
              )}
            </div>
            
            {/* Meta Description with AI suggestion */}
            <div>
              <div className="flex justify-between">
                <label className="block text-sm font-medium mb-1">Meta Description</label>
                <div className="flex items-center">
                  <span className={`text-xs mr-2 ${
                    seoData.metaDescription.length > 160 ? 'text-red-500' : 
                    seoData.metaDescription.length > 150 ? 'text-yellow-500' : 'text-gray-500'
                  }`}>
                    {seoData.metaDescription.length}/160 characters
                  </span>
                  <button
                    type="button"
                    onClick={() => generateAiSuggestion('description')}
                    disabled={generatingSuggestion === 'description'}
                    className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-800 disabled:text-gray-400"
                  >
                    <FaMagic className="text-xs" />
                    {generatingSuggestion === 'description' ? 'Generating...' : 'AI Suggest'}
                  </button>
                </div>
              </div>
              <textarea
                name="metaDescription"
                value={seoData.metaDescription}
                onChange={handleSeoChange}
                rows={3}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Enter meta description (150-160 characters recommended)"
              />
              {aiSuggestions.description && (
                <div className="mt-1 text-xs border border-purple-200 bg-purple-50 p-2 rounded">
                  <div className="flex justify-between">
                    <span className="font-medium text-purple-700">AI Suggestion:</span>
                    <button
                      type="button"
                      onClick={() => applyAiSuggestion('description')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-gray-700 mt-1">{aiSuggestions.description}</p>
                </div>
              )}
            </div>
            
            {/* URL Slug */}
            <div>
              <div className="flex justify-between">
                <label className="block text-sm font-medium mb-1">URL Slug</label>
                <span className={`text-xs ${
                  seoData.urlSlug.length > 50 ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {seoData.urlSlug.length} characters
                </span>
              </div>
              <div className="flex items-center">
                <span className="bg-gray-100 text-gray-500 px-3 py-2 border border-r-0 rounded-l-md text-sm">
                  /shop/product/
                </span>
                <input
                  type="text"
                  name="urlSlug"
                  value={seoData.urlSlug}
                  onChange={handleSeoChange}
                  className="flex-1 border rounded-r-md px-3 py-2"
                  placeholder="product-url-slug"
                />
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Use hyphens to separate words. Keep it short and descriptive.
              </div>
            </div>
            
            {/* Focus Keywords with AI suggestion */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium">Focus Keywords</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={generateKeywordSuggestions}
                    disabled={generatingKeywords}
                    className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-800 disabled:text-gray-400"
                  >
                    <FaRobot className="text-xs" />
                    {generatingKeywords ? 'Generating...' : 'Suggest Keywords'}
                  </button>
                  <button
                    type="button"
                    onClick={() => generateAiSuggestion('keywords')}
                    disabled={generatingSuggestion === 'keywords'}
                    className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-800 disabled:text-gray-400"
                  >
                    <FaMagic className="text-xs" />
                    {generatingSuggestion === 'keywords' ? 'Generating...' : 'AI Suggest'}
                  </button>
                </div>
              </div>
              {/* Rest of the keywords UI */}
              {aiSuggestions.keywords && aiSuggestions.keywords.length > 0 && (
                <div className="mt-1 text-xs border border-purple-200 bg-purple-50 p-2 rounded">
                  <div className="flex justify-between">
                    <span className="font-medium text-purple-700">AI Suggested Keywords:</span>
                    <button
                      type="button"
                      onClick={() => applyAiSuggestion('keywords')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Apply All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {aiSuggestions.keywords.map((keyword, idx) => (
                      <span key={idx} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Keyword suggestions */}
              {keywordSuggestions.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {keywordSuggestions.map((keyword, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addSuggestedKeyword(keyword)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
                      >
                        + {keyword}
                      </button>
                    ))}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Click a suggestion to add it as a keyword.
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                {seoData.focusKeywords.map((keyword, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => handleKeywordChange(index, e.target.value)}
                      className="flex-1 border rounded-md px-3 py-2"
                      placeholder={index === 0 ? "Primary keyword" : "Secondary keyword"}
                    />
                    {index === 0 ? (
                      <div className="w-8 h-8 flex items-center justify-center text-xs bg-blue-100 text-blue-800 rounded-full">
                        Main
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeKeyword(index)}
                        className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-full"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                
                {seoData.focusKeywords.length < 4 && (
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add keyword
                  </button>
                )}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Add 1-3 keywords that best describe this product.
              </div>
            </div>
            
            {/* Image Alt Text with AI suggestion */}
            <div>
              <div className="flex justify-between">
                <label className="block text-sm font-medium mb-1">Main Image Alt Text</label>
                <button
                  type="button"
                  onClick={() => generateAiSuggestion('altText')}
                  disabled={generatingSuggestion === 'altText'}
                  className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-800 disabled:text-gray-400"
                >
                  <FaMagic className="text-xs" />
                  {generatingSuggestion === 'altText' ? 'Generating...' : 'AI Suggest'}
                </button>
              </div>
              <input
                type="text"
                name="imageAltText"
                value={seoData.imageAltText}
                onChange={handleSeoChange}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Descriptive text for main product image"
              />
              {aiSuggestions.altText && (
                <div className="mt-1 text-xs border border-purple-200 bg-purple-50 p-2 rounded">
                  <div className="flex justify-between">
                    <span className="font-medium text-purple-700">AI Suggestion:</span>
                    <button
                      type="button"
                      onClick={() => applyAiSuggestion('altText')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-gray-700 mt-1">{aiSuggestions.altText}</p>
                </div>
              )}
              <div className="mt-1 text-xs text-gray-500">
                Describe the image for accessibility and SEO (keep under 125 characters).
              </div>
            </div>
            
            {/* Search Preview */}
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Search Result Preview</h3>
              <div className="border rounded-md p-3 bg-white">
                <div className="text-blue-600 text-lg font-medium truncate">
                  {seoData.metaTitle || 'Product Title | Awaknd Rebel'}
                </div>
                <div className="text-green-700 text-sm">
                  www.awakndrebel.com/shop/product/{seoData.urlSlug || 'product-url'}
                </div>
                <div className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {seoData.metaDescription || 'Your product description will appear here. Make it compelling to encourage clicks.'}
                </div>
              </div>
            </div>
            
            {/* SEO Tips */}
            <div className="mt-4 bg-blue-50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-blue-800 mb-1">SEO Tips</h3>
              <ul className="text-xs text-blue-700 list-disc pl-4 space-y-1">
                <li>Include your main keyword in the title, description, and URL</li>
                <li>Keep titles between 50-60 characters for optimal display</li>
                <li>Write compelling descriptions between 150-160 characters</li>
                <li>Use descriptive alt text for all product images</li>
                <li>Ensure your content matches the keywords you're targeting</li>
              </ul>
            </div>
            
            {/* Advanced SEO Analysis */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowAdvancedSeo(!showAdvancedSeo)}
                className="flex items-center justify-between w-full text-left text-sm font-medium text-blue-800 bg-blue-50 p-3 rounded-md hover:bg-blue-100"
              >
                <span className="flex items-center">
                  <MdOutlineAnalytics className="mr-2" />
                  Advanced SEO Analysis
                </span>
                <FaChevronDown className={`transform transition-transform ${showAdvancedSeo ? 'rotate-180' : ''}`} />
              </button>
              
              {showAdvancedSeo && (
                <div className="mt-3 space-y-4 border rounded-md p-4">
                  {/* Content Analysis */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <FaChartBar className="mr-1 text-blue-600" /> Content Analysis
                    </h4>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Content Quality</span>
                      <span className={`text-sm font-medium ${getScoreColor(seoAnalysis.contentAnalysis.score)}`}>
                        {seoAnalysis.contentAnalysis.score.toUpperCase()}
                      </span>
                    </div>
                    {seoAnalysis.contentAnalysis.suggestions.length > 0 && (
                      <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
                        {seoAnalysis.contentAnalysis.suggestions.map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  {/* Keyword Density */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <FaLightbulb className="mr-1 text-yellow-600" /> Keyword Analysis
                    </h4>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Keyword Density</span>
                      <span className={`text-sm font-medium ${getScoreColor(seoAnalysis.keywordDensity.score)}`}>
                        {seoAnalysis.keywordDensity.value}% ({seoAnalysis.keywordDensity.score.toUpperCase()})
                      </span>
                    </div>
                    {seoAnalysis.keywordDensity.suggestions.length > 0 && (
                      <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
                        {seoAnalysis.keywordDensity.suggestions.map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  {/* Readability */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Readability</h4>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Avg. Words Per Sentence</span>
                      <span className={`text-sm font-medium ${getScoreColor(seoAnalysis.readability.score)}`}>
                        {seoAnalysis.readability.value} ({seoAnalysis.readability.score.toUpperCase()})
                      </span>
                    </div>
                    {seoAnalysis.readability.suggestions.length > 0 && (
                      <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
                        {seoAnalysis.readability.suggestions.map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  {/* Competitor Keywords */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Competitor Keywords</h4>
                    <p className="text-xs text-gray-600 mb-2">
                      Popular keywords used by competitors in your product category:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {competitorKeywords.map((keyword, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => addSuggestedKeyword(keyword)}
                          className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200"
                        >
                          + {keyword}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* SEO Preview on Google */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Google Search Preview</h4>
                    <div className="border rounded p-3 bg-white">
                      <div className="text-blue-600 text-base font-medium truncate">
                        {seoData.metaTitle || formData.name} | Awaknd Rebel
                      </div>
                      <div className="text-green-700 text-xs">
                        www.awakndrebel.com › shop › product › {seoData.urlSlug || 'product-url'}
                      </div>
                      <div className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {seoData.metaDescription || formData.description?.substring(0, 160) || 'Product description...'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Structured Data Preview */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Structured Data (JSON-LD)</h4>
                    <div className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
                      {`{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "${formData.name || 'Product Name'}",
  "image": "${formData.image || 'https://example.com/image.jpg'}",
  "description": "${(seoData.metaDescription || formData.description || 'Product description').substring(0, 50)}...",
  "brand": {
    "@type": "Brand",
    "name": "Awaknd Rebel"
  },
  "offers": {
    "@type": "Offer",
    "price": "${formData.price || '0.00'}",
    "priceCurrency": "USD"
  }
}`}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This structured data helps search engines understand your product information.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="glass px-4 py-2 rounded-md font-medium flex items-center hover:bg-gray-100 transition-colors"
          disabled={uploading || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-accent-color rounded-full"></div>
              Saving...
            </>
          ) : (
            <>
              <FaSave className="mr-2" /> Save Product
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
