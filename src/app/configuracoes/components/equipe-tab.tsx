"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  PlusCircle, 
  MoreHorizontal, 
  Mail, 
  UserPlus, 
  UserX, 
  UserCheck, 
  Shield,
  Edit,
  Trash,
} from "lucide-react"

const membrosEquipe = [
  {
    id: "1",
    nome: "João Silva",
    email: "joao.silva@exemplo.com",
    cargo: "Gerente de Projetos",
    status: "ativo",
    acesso: "admin",
    avatar: "/avatars/user1.jpg",
  },
  {
    id: "2",
    nome: "Maria Oliveira",
    email: "maria@exemplo.com",
    cargo: "Designer UI/UX",
    status: "ativo",
    acesso: "membro",
    avatar: "/avatars/user2.jpg",
  },
  {
    id: "3",
    nome: "Carlos Santos",
    email: "carlos.santos@exemplo.com",
    cargo: "Desenvolvedor Frontend",
    status: "inativo",
    acesso: "membro",
    avatar: "/avatars/user3.jpg",
  },
  {
    id: "4",
    nome: "Ana Pereira",
    email: "ana.pereira@exemplo.com",
    cargo: "Analista de Marketing",
    status: "pendente",
    acesso: "membro",
    avatar: "/avatars/user4.jpg",
  },
  {
    id: "5",
    nome: "Roberto Costa",
    email: "roberto@exemplo.com",
    cargo: "Desenvolvedor Backend",
    status: "ativo",
    acesso: "membro",
    avatar: "/avatars/user5.jpg",
  },
]

export function EquipeTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gerenciar Equipe</CardTitle>
            <CardDescription>
              Gerencie os membros da sua equipe e suas permissões.
            </CardDescription>
          </div>
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Convidar Membro</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Input placeholder="Buscar membros..." className="max-w-sm" />
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acesso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membrosEquipe.map((membro) => (
                <TableRow key={membro.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={membro.avatar} alt={membro.nome} />
                        <AvatarFallback>{membro.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{membro.nome}</span>
                        <span className="text-xs text-muted-foreground">{membro.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{membro.cargo}</TableCell>
                  <TableCell>
                    {membro.status === "ativo" && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Ativo
                      </Badge>
                    )}
                    {membro.status === "inativo" && (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        Inativo
                      </Badge>
                    )}
                    {membro.status === "pendente" && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Pendente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {membro.acesso === "admin" && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Administrador
                      </Badge>
                    )}
                    {membro.acesso === "membro" && (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        Membro
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Mail className="h-4 w-4" /> Enviar email
                        </DropdownMenuItem>
                        {membro.status === "pendente" && (
                          <DropdownMenuItem className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4" /> Aprovar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Shield className="h-4 w-4" /> Alterar permissões
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Edit className="h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                          <Trash className="h-4 w-4" /> Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {membrosEquipe.length} membros
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled>
              Próximo
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 