import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export const createClient = (request: NextRequest) => {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          // Definir cookie na requisição
          request.cookies.set(name, value);
          
          // Definir cookie na resposta
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          
          // Usar a API de cookies do NextResponse
          response.cookies.set(name, value, options);
        },
        remove(name, options) {
          // Remover cookie da requisição
          request.cookies.delete(name);
          
          // Definir cookie na resposta com maxAge=0
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          
          // Usar a API de cookies do NextResponse com maxAge=0
          response.cookies.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );

  return { supabase, response };
}; 