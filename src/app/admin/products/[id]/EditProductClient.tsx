'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import BrandLoader from '@/components/BrandLoader';
import ProductForm from '@/components/ProductForm';
import { toast } from 'react-hot-toast';

export default function EditProductClient({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createBrowserClient();
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', params.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setProduct(data);
        } else {
          toast.error('Product not found');
          router.push('/admin/products');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
        router.push('/admin/products');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [params.id, router, supabase]);
  
  const handleSaveProduct = async (productData) => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', params.id);
        
      if (error) throw error;
      
      toast.success('Product updated successfully!');
      router.push('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    router.push('/admin/products');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <BrandLoader />
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      {product && (
        <ProductForm 
          initialData={product}
          onSave={handleSaveProduct}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}