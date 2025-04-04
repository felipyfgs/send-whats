"use client"

import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { MessageSquare, Clock, CheckCheck, Reply, FileType } from "lucide-react"

export function MensagensSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Reply className="h-5 w-5" />
            <span>Respostas Automáticas</span>
          </CardTitle>
          <CardDescription>
            Configure mensagens automáticas para quando você não estiver disponível.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-reply">Ativar Resposta Automática</Label>
              <p className="text-sm text-muted-foreground">
                Responder automaticamente a novas mensagens quando você não estiver disponível
              </p>
            </div>
            <Switch id="auto-reply" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="auto-reply-message">Mensagem de Resposta Automática</Label>
            <Textarea 
              id="auto-reply-message" 
              placeholder="Digite sua mensagem automática aqui"
              defaultValue="Olá! Obrigado por entrar em contato. No momento não estamos disponíveis, mas retornaremos sua mensagem assim que possível."
              className="min-h-[100px]"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Esta mensagem será enviada automaticamente para novas conversas.
              </p>
              <p className="text-xs text-muted-foreground">0/1000 caracteres</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCheck className="h-5 w-5" />
            <span>Confirmações de Leitura</span>
          </CardTitle>
          <CardDescription>
            Configure como as confirmações de leitura são mostradas e enviadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="read-receipts">Enviar Confirmações de Leitura</Label>
              <p className="text-sm text-muted-foreground">
                Permitir que os contatos vejam quando você leu as mensagens deles
              </p>
            </div>
            <Switch id="read-receipts" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="typing-indicator">Mostrar Indicador de Digitação</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar aos contatos quando você está digitando uma mensagem
              </p>
            </div>
            <Switch id="typing-indicator" defaultChecked />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span>Agendamento de Mensagens</span>
          </CardTitle>
          <CardDescription>
            Configure as opções de agendamento de mensagens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="schedule-enable">Ativar Agendamento</Label>
              <p className="text-sm text-muted-foreground">
                Permitir agendar mensagens para serem enviadas posteriormente
              </p>
            </div>
            <Switch id="schedule-enable" defaultChecked />
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="default-time">Horário Padrão para Agendamento</Label>
              <Input id="default-time" type="time" defaultValue="10:00" />
              <p className="text-xs text-muted-foreground">
                Horário sugerido por padrão ao agendar mensagens.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-future">Máximo de Dias para Agendamento</Label>
              <Input id="max-future" type="number" defaultValue="30" min="1" max="365" />
              <p className="text-xs text-muted-foreground">
                Número máximo de dias no futuro para agendar mensagens.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <span>Mensagem de Ausência</span>
          </CardTitle>
          <CardDescription>
            Configure uma mensagem para períodos em que estiver ausente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="away-message">Ativar Mensagem de Ausência</Label>
              <p className="text-sm text-muted-foreground">
                Enviar uma mensagem automática informando que você está ausente
              </p>
            </div>
            <Switch id="away-message" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="away-text">Texto da Mensagem de Ausência</Label>
            <Textarea 
              id="away-text" 
              placeholder="Digite sua mensagem de ausência aqui"
              defaultValue="Olá! Estou em período de férias até 15/01. Em caso de urgência, por favor entre em contato com nossa equipe de suporte pelo email: suporte@empresa.com"
              className="min-h-[100px]"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Esta mensagem será enviada durante o período de ausência configurado.
              </p>
              <p className="text-xs text-muted-foreground">0/1000 caracteres</p>
            </div>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="away-start">Data de Início</Label>
              <Input id="away-start" type="date" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="away-end">Data de Término</Label>
              <Input id="away-end" type="date" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileType className="h-5 w-5" />
            <span>Formato de Mensagens</span>
          </CardTitle>
          <CardDescription>
            Configure o formato padrão para suas mensagens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Estilo de Texto Padrão</Label>
            <ToggleGroup type="single" defaultValue="normal" className="justify-start">
              <ToggleGroupItem value="normal">Normal</ToggleGroupItem>
              <ToggleGroupItem value="formal">Formal</ToggleGroupItem>
              <ToggleGroupItem value="casual">Casual</ToggleGroupItem>
              <ToggleGroupItem value="direct">Direto</ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="signature">Assinatura de Mensagem</Label>
            <Textarea 
              id="signature" 
              placeholder="Digite sua assinatura"
              defaultValue="Atenciosamente,\nEquipe de Suporte\nEmpresa XYZ"
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              Esta assinatura será adicionada ao final das suas mensagens.
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emoji">Permitir Emojis</Label>
              <p className="text-sm text-muted-foreground">
                Habilitar o uso de emojis nas mensagens
              </p>
            </div>
            <Switch id="emoji" defaultChecked />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline">Redefinir</Button>
            <Button>Salvar Preferências</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 