import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nifghisvlnoeywodupmx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZmdoaXN2bG5vZXl3b2R1cG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjkxMTUsImV4cCI6MjA4MzYwNTExNX0.smMbpRmvH3cj4IwgiINpc-qTRcdu0TYZuZ6S4tLQrWI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
