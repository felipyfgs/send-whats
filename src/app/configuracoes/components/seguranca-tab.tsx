"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { LockIcon, ShieldCheck, AlertCircle, Smartphone, KeyRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

const senhaFormSchema = z.object({
  senha_atual: z.string().min(1, {
    message: "Senha atual é obrigatória.",
  }),
  nova_senha: z.string().min(8, {
    message: "Senha deve ter pelo menos 8 caracteres.",
  }),
  confirmar_senha: z.string().min(8, {
    message: "Senha deve ter pelo menos 8 caracteres.",
  }),
}).refine((data) => data.nova_senha === data.confirmar_senha, {
  message: "As senhas não coincidem",
  path: ["confirmar_senha"],
})

type SenhaFormValues = z.infer<typeof senhaFormSchema>

const defaultValues: Partial<SenhaFormValues> = {
  senha_atual: "",
  nova_senha: "",
  confirmar_senha: "",
}

export function SegurancaTab() {
  const form = useForm<SenhaFormValues>({
    resolver: zodResolver(senhaFormSchema),
    defaultValues,
  })

  function onSubmit(data: SenhaFormValues) {
    // Implementar a lógica de alteração de senha
    console.log(data)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LockIcon className="h-5 w-5" />
            <span>Alterar Senha</span>
          </CardTitle>
          <CardDescription>
            Altere sua senha de acesso à plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="senha_atual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha Atual</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Digite sua senha atual" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="nova_senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Digite sua nova senha" {...field} />
                    </FormControl>
                    <FormDescription>
                      A senha deve ter pelo menos 8 caracteres.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmar_senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nova Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirme sua nova senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline">Cancelar</Button>
                <Button type="submit">Atualizar Senha</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            <span>Autenticação de Dois Fatores</span>
          </CardTitle>
          <CardDescription>
            Adicione uma camada extra de segurança à sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">Autenticação por SMS</h4>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Desativado
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Receba códigos de verificação por SMS.
              </p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">Aplicativo Autenticador</h4>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Ativado
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Use um aplicativo como Google Authenticator.
              </p>
            </div>
            <Switch checked={true} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">Chave de Segurança</h4>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Desativado
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Use uma chave de segurança física (USB).
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">Gerenciar Configurações 2FA</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            <span>Sessões Ativas</span>
          </CardTitle>
          <CardDescription>
            Gerencie os dispositivos conectados à sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">Windows 10 - Chrome</h4>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Atual
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  São Paulo, Brasil • IP: 187.15.xx.xx • Última atividade: Agora
                </p>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-medium">iPhone 13 - Safari</h4>
                <p className="text-xs text-muted-foreground">
                  São Paulo, Brasil • IP: 187.15.xx.xx • Última atividade: 2 horas atrás
                </p>
              </div>
              <Button variant="outline" size="sm">Encerrar</Button>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-medium">MacBook Pro - Safari</h4>
                <p className="text-xs text-muted-foreground">
                  Rio de Janeiro, Brasil • IP: 201.17.xx.xx • Última atividade: 5 dias atrás
                </p>
              </div>
              <Button variant="outline" size="sm">Encerrar</Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
            Encerrar Todas as Outras Sessões
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 