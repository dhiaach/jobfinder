import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://snlqtyfcnrtbgpacigrw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNubHF0eWZjbnJ0YmdwYWNpZ3J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1OTAxMjksImV4cCI6MjA2MTE2NjEyOX0.76sX3UIuUcsuQVCq9RYBkySkxSsED18Yz-x8NkJArg0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoConfirmEmail: true,       // Must come first
    detectSessionInUrl: false,    // Disable URL session checks
    storage: localStorage,        // Session storage
    autoRefreshToken: true,       // Token management
    persistSession: true          // Session persistence
  }
});