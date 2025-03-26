import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function generateStaticParams() {
  // Hardcoded IDs to ensure we always have something
  const fallbackIds = [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '40e1f01f-c321-45b5-8e36-638c6f7e34f9' }
  ];
  
  try {
    // Fetch all product IDs from Supabase
    const { data, error } = await supabase
      .from('products')
      .select('id');
      
    if (error) {
      console.error('Error fetching product IDs:', error);
      return fallbackIds;
    }
    
    // Map the data to the expected format
    const params = data.map(product => ({
      id: String(product.id)
    }));
    
    return params.length > 0 ? params : fallbackIds;
  } catch (err) {
    console.error('Failed to generate static params:', err);
    return fallbackIds;
  }
}
