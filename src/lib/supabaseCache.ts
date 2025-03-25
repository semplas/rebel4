// Create a new file for caching Supabase responses
import { supabase } from './supabase';

// Simple in-memory cache
const cache = new Map<string, {
  data: any;
  timestamp: number;
}>();

const CACHE_DURATION = 60 * 1000; // 1 minute cache

export async function cachedQuery<T>(
  table: string,
  query: string,
  params: any = {},
  forceRefresh = false
): Promise<T[]> {
  const cacheKey = `${table}:${query}:${JSON.stringify(params)}`;
  
  // Return cached data if available and not expired
  if (!forceRefresh && cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data;
    }
  }
  
  // Perform the query with timeout
  try {
    const { data, error } = await supabase
      .from(table)
      .select(query)
      .order('id', { ascending: false })
      .limit(params.limit || 100);
      
    if (error) throw error;
    
    // Cache the result
    cache.set(cacheKey, {
      data: data || [],
      timestamp: Date.now()
    });
    
    return data || [];
  } catch (error) {
    console.error(`Error querying ${table}:`, error);
    // Return empty array or cached data if available
    return (cache.get(cacheKey)?.data || []) as T[];
  }
}

// Clear cache for specific table or all tables
export function clearCache(table?: string) {
  if (table) {
    // Clear only entries for specific table
    for (const key of cache.keys()) {
      if (key.startsWith(`${table}:`)) {
        cache.delete(key);
      }
    }
  } else {
    // Clear entire cache
    cache.clear();
  }
}