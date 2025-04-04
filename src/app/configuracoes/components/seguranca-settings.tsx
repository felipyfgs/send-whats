"use client"

import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ShieldCheck } from "lucide-react"

export function SegurancaSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <span>Segurança da Conta</span>
          </CardTitle>
          <CardDescription>
            Configure as opções de segurança da sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="login-notification">Notificar sobre novos logins</Label>
              <p className="text-sm text-muted-foreground">
                Receber notificações por email quando houver login em um novo dispositivo
              </p>
            </div>
            <Switch id="login-notification" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ip-block">Bloqueio de IPs desconhecidos</Label>
              <p className="text-sm text-muted-foreground">
                Bloquear tentativas de acesso de IPs não reconhecidos
              </p>
            </div>
            <Switch id="ip-block" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-logout">Logout automático</Label>
              <p className="text-sm text-muted-foreground">
                Fazer logout automaticamente após 30 minutos de inatividade
              </p>
            </div>
            <Switch id="auto-logout" defaultChecked />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline">Cancelar</Button>
            <Button>Salvar Alterações</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 