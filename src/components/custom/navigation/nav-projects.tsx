"use client"

import Link from "next/link"
import { PlusCircle, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
  return (
    <SidebarGroup>
      <div className="flex items-center justify-between px-4 py-2">
        <SidebarGroupLabel>Projetos</SidebarGroupLabel>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>
      <SidebarMenu>
        {projects.map((project) => (
          <SidebarMenuItem key={project.name}>
            <SidebarMenuButton tooltip={project.name} asChild>
              <Link href={project.url}>
                <project.icon className="h-5 w-5" />
                <span>{project.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
