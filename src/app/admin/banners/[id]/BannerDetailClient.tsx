'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import BrandLoader from '@/components/BrandLoader';
import BannerForm from '@/components/BannerForm';
import { toast } from 'react-hot-toast';

export default function BannerDetailClient({ params }) {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createBrowserClient();
  
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .eq('id', params.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setBanner(data);
        } else {
          toast.error('Banner not found');
          router.push('/admin/banners');
        }
      } catch (error) {
        console.error('Error fetching banner:', error);
        toast.error('Failed to load banner');
        router.push('/admin/banners');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBanner();
  }, [params.id, router, supabase]);
  
  const handleSaveBanner = async (bannerData) => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('banners')
        .update(bannerData)
        .eq('id', params.id);
        
      if (error) throw error;
      
      toast.success('Banner updated successfully!');
      router.push('/admin/banners');
    } catch (error) {
      console.error('Error updating banner:', error);
      toast.error('Failed to update banner');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    router.push('/admin/banners');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <BrandLoader />
      </div>
    );
  }
  
  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Banner</h1>
      
      {banner && (
        <BannerForm 
          initialData={banner}
          onSave={handleSaveBanner}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}