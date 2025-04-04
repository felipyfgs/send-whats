"use client"

import * as React from "react"
import {
  BarChart3,
  HomeIcon,
  Settings,
  Users2,
  LayoutDashboard,
  BookMarked,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Dados do usuário
const data = {
  user: {
    name: "Usuário Demo",
    email: "usuario@exemplo.com",
    avatar: "/avatars/user.jpg",
  },
  teams: [
    {
      name: "Minha Empresa",
      logo: BarChart3,
      plan: "Empresarial",
    },
    {
      name: "Projeto Pessoal",
      logo: HomeIcon,
      plan: "Gratuito",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Contatos",
      url: "/contatos",
      icon: Users2,
      isActive: false,
    },
    {
      title: "Campanhas",
      url: "/campanhas",
      icon: BookMarked,
      isActive: false,
    },
    {
      title: "Configurações",
      url: "/configuracoes",
      icon: Settings,
      items: [
        {
          title: "Geral",
          url: "/configuracoes?tab=geral",
        },
        {
          title: "Limites e Uso",
          url: "/configuracoes?tab=limites",
        },
        {
          title: "Segurança",
          url: "/configuracoes?tab=seguranca",
        },
        {
          title: "API WhatsApp",
          url: "/configuracoes?tab=api",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
