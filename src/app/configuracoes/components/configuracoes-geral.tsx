"use client"

import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings } from "lucide-react"

export function ConfiguracoesGeral() {
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
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline">Cancelar</Button>
            <Button>Salvar Alterações</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 