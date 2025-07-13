import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sjaiedyjxlxazcemsmmt.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqYWllZHlqeGx4YXpjZW1zbW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNTUxMDIsImV4cCI6MjA2NzgzMTEwMn0.8j4wfJUKqNPHjWEXU5VHm-NcImDiDG4a-wmoVb1e5Gw';

export const supabase = createClient(supabaseUrl, supabaseKey);
