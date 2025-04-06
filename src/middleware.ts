import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Cria o cliente do Supabase para o middleware
  const { supabase, response } = createClient(request);

  // Atualiza a sessão se existir um token de acesso
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Rotas que precisam de autenticação
  const authRoutes = ['/dashboard', '/campanhas', '/contatos'];
  // Rotas para acesso apenas de visitantes não autenticados
  const publicRoutes = ['/login'];

  const path = request.nextUrl.pathname;

  // Verifica se o usuário está tentando acessar uma rota protegida sem autenticação
  if (authRoutes.some(route => path.startsWith(route)) && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verifica se o usuário autenticado está tentando acessar rotas públicas
  if (publicRoutes.includes(path) && session) {
    return NextResponse.redirect(new URL('/campanhas', request.url));
  }

  return response;
}

// Define quais rotas devem passar pelo middleware
export const config = {
  matcher: [
    /*
     * Corresponde a todas estas rotas:
     * - /
     * - /dashboard
     * - /login
     * - /campanhas
     * - /contatos
     */
    '/',
    '/dashboard/:path*',
    '/login',
    '/campanhas/:path*',
    '/contatos/:path*',
  ],
}; 