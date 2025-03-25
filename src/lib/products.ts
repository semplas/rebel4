import { cachedQuery } from './supabaseCache';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/product';
import { compressImage } from './imageCompression';

// Fetch all products with caching
export async function getAllProducts(forceRefresh = false): Promise<Product[]> {
  try {
    return await cachedQuery<Product>('products', '*', {}, forceRefresh);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return generateMockProducts();
  }
}

// Get product by ID with optimized query and better error handling
export async function getProductById(id: string): Promise<Product | null> {
  console.log('Fetching product with ID:', id);
  
  if (!id) {
    console.error('Invalid product ID provided');
    return null;
  }
  
  try {
    // First try to get from Supabase
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Supabase error fetching product:', error);
      // Don't throw, continue to fallback
    }
    
    if (data) {
      console.log('Found product in database:', data.name);
      
      // Ensure product has all required fields with valid types
      const validatedProduct: Product = {
        id: data.id,
        name: data.name || 'Unnamed Product',
        price: typeof data.price === 'number' ? data.price : 
               typeof data.price === 'string' ? parseFloat(data.price) : 0,
        description: data.description || 'No description available',
        category: data.category || 'Uncategorized',
        images: Array.isArray(data.images) ? data.images : [],
        image: data.image || '',
        // Add any other required fields with defaults
      };
      
      return validatedProduct;
    }
    
    // If not found in database or invalid, try mock data as fallback
    console.log('Product not found in database or invalid, trying mock data');
    const mockProducts = generateMockProducts();
    const mockProduct = mockProducts.find(p => p.id === id);
    
    if (mockProduct) {
      console.log('Found product in mock data:', mockProduct.name);
      return mockProduct;
    }
    
    console.log('Product not found in mock data either');
    return null;
  } catch (error) {
    console.error('Error in getProductById:', error);
    
    // Final fallback to mock data
    try {
      const mockProducts = generateMockProducts();
      const product = mockProducts.find(p => p.id === id);
      
      if (product) {
        console.log('Fallback to mock product:', product.name);
        return product;
      }
    } catch (mockError) {
      console.error('Error in mock fallback:', mockError);
    }
    
    return null;
  }
}

// Helper function to generate mock products
export function generateMockProducts(): Product[] {
  // Create 20 mock products
  return Array.from({ length: 20 }, (_, i) => ({
    id: (i + 1).toString(),
    name: `Product ${i + 1}`,
    description: 'This is a mock product description.',
    price: Math.floor(Math.random() * 100) + 20,
    category: ['Sneakers', 'Boots', 'Casual', 'Formal'][Math.floor(Math.random() * 4)],
    image: '/images/1.png',
    images: [
      '/images/1.png',
      '/images/1.png'
    ],
    isNew: Math.random() > 0.7,
    isOnSale: Math.random() > 0.8,
    rating: Math.floor(Math.random() * 5) + 1,
    stock: Math.floor(Math.random() * 50) + 1,
    createdAt: new Date().toISOString()
  }));
}

// Add this function to handle product image uploads
export async function uploadProductImage(file: File): Promise<string> {
  try {
    console.log('Compressing and uploading file:', file.name);
    // First check if the user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('You must be logged in to upload images');
    }

    // Compress the image before uploading
    const compressedFile = await compressImage(file);
    console.log(`Original size: ${(file.size / 1024).toFixed(2)}KB, Compressed: ${(compressedFile.size / 1024).toFixed(2)}KB`);

    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = `${fileName}`;
    
    // Upload to the images bucket
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
    
    // Get public URL for the uploaded image
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
    
    if (!urlData || !urlData.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }
    
    console.log('Successfully uploaded:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Failed to upload product image:', error);
    throw error;
  }
}

// Delete a product and its associated images
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    // First check if the user is an admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('You must be logged in to delete products');
    }
    
    // Get the user's profile to check admin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();
      
    if (profileError || !profile || !profile.is_admin) {
      throw new Error('You must be an admin to delete products');
    }
    
    // First, get the product to retrieve its images
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (productError) {
      console.error('Error fetching product for deletion:', productError);
      throw productError;
    }
    
    // Collect all image paths to delete
    const imagesToDelete: string[] = [];
    
    // Add main image if it exists and isn't a placeholder
    if (product.image && !product.image.includes('/images/placeholder')) {
      // Extract filename from URL
      const imageUrl = new URL(product.image);
      const pathParts = imageUrl.pathname.split('/');
      const filename = pathParts[pathParts.length - 1];
      
      if (filename) imagesToDelete.push(filename);
    }
    
    // Add additional images if they exist
    if (product.images) {
      let additionalImages = [];
      
      // Parse images if it's a string
      if (typeof product.images === 'string') {
        try {
          additionalImages = JSON.parse(product.images);
        } catch (e) {
          console.error('Error parsing images JSON:', e);
        }
      } else if (Array.isArray(product.images)) {
        additionalImages = product.images;
      }
      
      // Extract filenames from URLs
      for (const imgUrl of additionalImages) {
        if (imgUrl && !imgUrl.includes('/images/placeholder')) {
          const imageUrl = new URL(imgUrl);
          const pathParts = imageUrl.pathname.split('/');
          const filename = pathParts[pathParts.length - 1];
          
          if (filename) imagesToDelete.push(filename);
        }
      }
    }
    
    // Delete the product from the database
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
    
    // Delete images from storage if there are any
    if (imagesToDelete.length > 0) {
      console.log('Deleting images:', imagesToDelete);
      
      const { error: storageError } = await supabase.storage
        .from('images')
        .remove(imagesToDelete);
      
      if (storageError) {
        console.error('Error deleting product images from storage:', storageError);
        // We don't throw here as the product is already deleted
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to delete product with ID ${id}:`, error);
    throw error;
  }
}

// Create a new product
export async function createProduct(productData: Partial<Product>): Promise<Product> {
  try {
    console.log('Starting createProduct with data:', productData);
    
    // First check if the user is an admin
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Failed to get session');
    }
    
    if (!session) {
      console.error('No session found');
      throw new Error('You must be logged in to create products');
    }
    
    console.log('Session found for user:', session.user.id);
    
    // Add a small delay to ensure auth state is fully updated
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get the user's profile to check admin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('Profile error:', profileError);
      throw new Error(`Failed to check admin status: ${profileError.message}`);
    }
    
    console.log('Profile data:', profile);
    
    if (!profile) {
      console.error('No profile found for user');
      throw new Error('User profile not found');
    }
    
    if (!profile.is_admin) {
      console.error('User is not admin');
      throw new Error('You must be an admin to create products');
    }
    
    console.log('Admin status verified, creating product');
    
    // Prepare the data for insertion - REMOVE SEO FIELDS
    const dbProductData = {
      ...productData,
      features: productData.features ? JSON.stringify(productData.features) : null,
      images: productData.images ? JSON.stringify(productData.images) : null,
      // Remove SEO fields for now
    };
    
    console.log('Prepared product data for DB:', dbProductData);
    
    // Now create the product
    const { data, error } = await supabase
      .from('products')
      .insert([dbProductData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }
    
    // Convert JSONB back to arrays for the returned data
    const processedProduct = {
      ...data,
      features: data.features ? JSON.parse(data.features) : [],
      images: data.images ? JSON.parse(data.images) : [],
    };
    
    console.log('Product created successfully:', processedProduct);
    return processedProduct;
  } catch (error) {
    console.error('Failed to create product:', error);
    throw error;
  }
}

// Update an existing product
export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  try {
    console.log('Starting updateProduct with ID:', id);
    
    // First check if the user is an admin
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Failed to get session');
    }
    
    if (!session) {
      console.error('No session found');
      throw new Error('You must be logged in to update products');
    }
    
    console.log('Session found for user:', session.user.id);
    
    // Add a small delay to ensure auth state is fully updated
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get the user's profile to check admin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('Profile error:', profileError);
      throw new Error(`Failed to check admin status: ${profileError.message}`);
    }
    
    console.log('Profile data:', profile);
    
    if (!profile) {
      console.error('No profile found for user');
      throw new Error('User profile not found');
    }
    
    if (!profile.is_admin) {
      console.error('User is not admin');
      throw new Error('You must be an admin to update products');
    }
    
    console.log('Admin status verified, updating product');
    
    // Prepare the data for update
    // Convert arrays to JSONB for Postgres
    const dbProductData = {
      ...productData,
      features: productData.features ? JSON.stringify(productData.features) : undefined,
      images: productData.images ? JSON.stringify(productData.images) : undefined,
    };
    
    // Now update the product
    const { data, error } = await supabase
      .from('products')
      .update(dbProductData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }
    
    // Convert JSONB back to arrays for the returned data
    const processedProduct = {
      ...data,
      features: data.features ? JSON.parse(data.features) : [],
      images: data.images ? JSON.parse(data.images) : [],
    };
    
    console.log('Product updated successfully:', processedProduct);
    return processedProduct;
  } catch (error) {
    console.error(`Failed to update product with ID ${id}:`, error);
    throw error;
  }
}
