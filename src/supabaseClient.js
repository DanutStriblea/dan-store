import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cxoacgsfbpiwggyaolqk.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4b2FjZ3NmYnBpd2dneWFvbHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1MzI4NTAsImV4cCI6MjA1NTEwODg1MH0.dWwiqSgn95gLsO8INo_jWhXzu_OoXlhJGBzk1dLGuxw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true, // Activează auto-refresh pentru sesiuni
    detectSessionInUrl: true, // Asigură că detectează token-urile după autentificare
  },
});
