import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CookieOptions } from '@supabase/ssr';

export function createClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // O método `set` foi chamado de um Server Component.
            // Isso pode ser ignorado se você tiver um middleware
            // atualizando as sessões de usuário.
          }
        },
        remove(name, options: CookieOptions) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          } catch (error) {
            // O método `remove` foi chamado de um Server Component.
            // Isso pode ser ignorado se você tiver um middleware
            // atualizando as sessões de usuário.
          }
        },
      },
    },
  );
} 