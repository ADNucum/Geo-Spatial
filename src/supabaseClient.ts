// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zysitvxjbrndjukikkut.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5c2l0dnhqYnJuZGp1a2lra3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0MTkxMzgsImV4cCI6MjA0Nzk5NTEzOH0.bzTNNBasZfbGHsh8VWiyivxkE1fH_2tYY4b6v4Cyn60';

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or key is missing');
  }
  

export const supabase = createClient(supabaseUrl, supabaseKey);


