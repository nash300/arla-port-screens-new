// Initialize Supabase client
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hxymtngjcuktessmbrks.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4eW10bmdqY3VrdGVzc21icmtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMTMzMDEsImV4cCI6MjA1NjU4OTMwMX0.urRkEgCuBZCxY6vWb4HPOmx0ipjYIdCEBgK5gsYAu6M";
const supabase = createClient(supabaseUrl, supabaseKey);

// Export Supabase client
export default supabase;
