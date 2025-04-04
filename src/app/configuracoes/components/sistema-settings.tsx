"use client"

import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, RefreshCw, Globe, Database, Clock } from "lucide-react"

export function SistemaSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <span>Configurações Gerais</span>
          </CardTitle>
          <CardDescription>
            Configure as opções gerais do sistema de campanhas WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="business-name">Nome da Empresa</Label>
              <Input id="business-name" defaultValue="Minha Empresa" />
              <p className="text-xs text-muted-foreground">
                Este nome aparecerá nas comunicações aos clientes.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone-number">Número WhatsApp</Label>
              <Input id="phone-number" defaultValue="+55 11 99999-9999" />
              <p className="text-xs text-muted-foreground">
                Número principal usado para as campanhas.
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timezone">Fuso Horário</Label>
            <Select defaultValue="America/Sao_Paulo">
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Selecione o fuso horário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Fuso horário utilizado para agendar mensagens e campanhas.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language">Idioma do Sistema</Label>
            <Select defaultValue="pt-BR">
              <SelectTrigger id="language">
                <SelectValue placeholder="Selecione o idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Idioma da interface do sistema.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <span>Limites e Uso</span>
          </CardTitle>
          <CardDescription>
            Configure os limites de uso e comportamento do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="msg-per-day">Limite de Mensagens Diárias</Label>
            <Select defaultValue="1000">
              <SelectTrigger id="msg-per-day">
                <SelectValue placeholder="Selecione o limite" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="500">500 mensagens/dia</SelectItem>
                <SelectItem value="1000">1.000 mensagens/dia</SelectItem>
                <SelectItem value="5000">5.000 mensagens/dia</SelectItem>
                <SelectItem value="10000">10.000 mensagens/dia</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Defina o número máximo de mensagens enviadas por dia.
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="throttling">Controle de Velocidade</Label>
              <p className="text-sm text-muted-foreground">
                Limitar a taxa de envio para evitar bloqueios pelo WhatsApp
              </p>
            </div>
            <Switch id="throttling" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="backup">Backup Automático</Label>
              <p className="text-sm text-muted-foreground">
                Realizar backup diário dos dados e conversas
              </p>
            </div>
            <Switch id="backup" defaultChecked />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span>Horário de Funcionamento</span>
          </CardTitle>
          <CardDescription>
            Configure os horários em que o sistema pode enviar mensagens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start-time">Horário de Início</Label>
              <Input id="start-time" type="time" defaultValue="08:00" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-time">Horário de Término</Label>
              <Input id="end-time" type="time" defaultValue="20:00" />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekend">Enviar aos Finais de Semana</Label>
              <p className="text-sm text-muted-foreground">
                Permitir o envio de mensagens aos sábados e domingos
              </p>
            </div>
            <Switch id="weekend" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="respect-hours">Respeitar Horário</Label>
              <p className="text-sm text-muted-foreground">
                Adiar mensagens fora do horário para o próximo período válido
              </p>
            </div>
            <Switch id="respect-hours" defaultChecked />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline">Redefinir Padrões</Button>
            <Button>Salvar Alterações</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 