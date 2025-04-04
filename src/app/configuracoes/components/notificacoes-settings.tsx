"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BellRing, Mail, MessageSquare, AlertTriangle, Smartphone } from "lucide-react"

export function NotificacoesSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            <span>Notificações</span>
          </CardTitle>
          <CardDescription>
            Configure como e quando você deseja receber notificações do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Canais de Notificação</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="email-notifications">Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações por email
                  </p>
                </div>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="sms-notifications">SMS</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações por SMS
                  </p>
                </div>
              </div>
              <Switch id="sms-notifications" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="push-notifications">Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações push no navegador
                  </p>
                </div>
              </div>
              <Switch id="push-notifications" defaultChecked />
            </div>
          </div>
          
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-medium">Eventos de Notificação</h3>
            
            <div className="space-y-2">
              <Label htmlFor="new-message">Novas Mensagens</Label>
              <Select defaultValue="all">
                <SelectTrigger id="new-message">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as mensagens</SelectItem>
                  <SelectItem value="mentions">Apenas menções diretas</SelectItem>
                  <SelectItem value="important">Apenas mensagens importantes</SelectItem>
                  <SelectItem value="none">Não notificar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="campaign-status">Status de Campanha</Label>
              <Select defaultValue="complete">
                <SelectTrigger id="campaign-status">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as atualizações</SelectItem>
                  <SelectItem value="complete">Apenas quando completar</SelectItem>
                  <SelectItem value="error">Apenas em caso de erros</SelectItem>
                  <SelectItem value="none">Não notificar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="system-notification">Notificações do Sistema</Label>
              <Select defaultValue="important">
                <SelectTrigger id="system-notification">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as notificações</SelectItem>
                  <SelectItem value="important">Apenas importantes</SelectItem>
                  <SelectItem value="none">Não notificar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-amber-50 dark:bg-amber-950/50">
          <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            <span>Notificações Críticas</span>
          </CardTitle>
          <CardDescription className="text-amber-700 dark:text-amber-300">
            Notificações críticas que não podem ser desativadas para sua segurança.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <p className="text-sm">
            As seguintes notificações serão sempre enviadas e não podem ser desativadas:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Alertas de segurança (tentativas de login suspeitas)</li>
            <li>Atualizações críticas do sistema</li>
            <li>Informações de faturamento importantes</li>
            <li>Bloqueio ou suspensão da sua conta</li>
            <li>Alterações nas políticas do WhatsApp Business</li>
          </ul>
          <p className="text-sm text-muted-foreground pt-2">
            Estas notificações são essenciais para sua segurança e para a conformidade com as políticas do WhatsApp.
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 