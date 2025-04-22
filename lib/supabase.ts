import { createClient } from '@supabase/supabase-js';

// Variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente para el frontend (anon, accesible por el cliente)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente para el backend (service role, solo accesible en el servidor)
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
