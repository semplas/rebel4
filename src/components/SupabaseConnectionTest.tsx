'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SupabaseConnectionTest() {
  const [status, setStatus] = useState<'testing' | 'connected' | 'failed'>('testing');
  const [error, setError] = useState<string | null>(null);
  const [envVars, setEnvVars] = useState<{url: string | null, key: string | null}>({
    url: null,
    key: null
  });
  const [dbStatus, setDbStatus] = useState<'unknown' | 'exists' | 'missing'>('unknown');
  const [responseTime, setResponseTime] = useState<number | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Check environment variables
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        setEnvVars({
          url: url ? `${url.substring(0, 8)}...` : 'Not set',
          key: key ? `${key.substring(0, 8)}...` : 'Not set'
        });

        // Test auth connection with timing
        const startTime = performance.now();
        const { data, error } = await supabase.auth.getSession();
        const endTime = performance.now();
        setResponseTime(Math.round(endTime - startTime));
        
        if (error) {
          throw error;
        }
        
        // Test a simple query to verify database access
        const { error: tableError } = await supabase
          .from('products')
          .select('id')
          .limit(1);
          
        if (tableError) {
          if (tableError.message.includes('does not exist')) {
            setDbStatus('missing');
          } else if (tableError.code !== 'PGRST116') {
            // PGRST116 means no rows found, which is fine
            throw tableError;
          }
        } else {
          setDbStatus('exists');
        }
        
        // If we get here, the connection is working
        setStatus('connected');
      } catch (err: any) {
        console.error('Supabase connection test failed:', err);
        setStatus('failed');
        setError(err.message || 'Unknown error');
      }
    };
    
    testConnection();
  }, []);

  return (
    <div className="p-4 border rounded-md">
      <h3 className="text-lg font-semibold mb-2">Supabase Connection Test</h3>
      
      <div className="space-y-2 text-sm">
        <p>Status: {
          status === 'testing' ? '🔄 Testing connection...' :
          status === 'connected' ? '✅ Connected to Supabase' :
          '❌ Failed to connect to Supabase'
        }</p>
        
        {responseTime && (
          <p>Response Time: {responseTime}ms {responseTime > 500 ? '⚠️ Slow' : '✅ Good'}</p>
        )}
        
        <p>SUPABASE_URL: {envVars.url}</p>
        <p>SUPABASE_ANON_KEY: {envVars.key}</p>
        
        {status === 'connected' && (
          <p>Database Tables: {
            dbStatus === 'unknown' ? 'Checking...' :
            dbStatus === 'exists' ? '✅ Products table exists' :
            '⚠️ Products table missing - needs migration'
          }</p>
        )}
        
        {error && (
          <div className="text-red-500 mt-2">
            <p>Error: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
