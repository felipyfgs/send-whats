"use client"

import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { KeyRound } from "lucide-react"

export function ApiSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            <span>API WhatsApp</span>
          </CardTitle>
          <CardDescription>
            Chaves de acesso à API do WhatsApp Business.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Token da API WhatsApp</Label>
            <div className="flex gap-2">
              <Input type="password" value="••••••••••••••••••••••••••••••" readOnly />
              <Button variant="outline" className="shrink-0">Mostrar</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Este token é usado para autenticar as requisições ao WhatsApp Business API.
            </p>
          </div>
          
          <div className="space-y-2 mt-4">
            <Label>Webhook URL</Label>
            <Input value="https://meuapp.com.br/api/whatsapp/webhook" readOnly />
            <p className="text-xs text-muted-foreground">
              Configure esta URL no painel do WhatsApp Business para receber notificações.
            </p>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline">Regenerar Token</Button>
            <Button>Salvar Alterações</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 