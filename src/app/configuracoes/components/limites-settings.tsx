"use client"

import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Database } from "lucide-react"

export function LimitesSettings() {
  return (
    <div className="space-y-6">
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
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline">Cancelar</Button>
            <Button>Salvar Alterações</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 