import { createClient } from '@supabase/supabase-js';

// هدول السطرين بيقرأوا الروابط يلي حطيناهم بالـ Secrets
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// هون عم ننشئ "العميل" يلي رح نستخدمه لنحكي مع قاعدة البيانات
export const supabase = createClient(supabaseUrl, supabaseAnonKey);