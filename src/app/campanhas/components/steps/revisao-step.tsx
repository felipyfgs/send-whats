"use client";

import React, { useState } from "react";
import { Campanha } from "@/contexts/campanhasContext";
import { useContatos } from "@/contexts/contatosContext";
import { MensagemPreview } from "@/components/custom/mensagem-preview";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Clock,
  Info,
  Laptop,
  Megaphone,
  Smartphone,
  Target,
  Users,
  Tags,
} from "lucide-react";

// Interface estendida para incluir o campo messages
interface CampanhaWithMessages extends Partial<Campanha> {
  messages?: Array<{
    content?: string;
    mediaFiles?: Array<{
      id?: string;
      type: "image" | "audio" | "video" | "file";
      url: string;
      name: string;
      size?: string;
    }>;
  }>;
}

interface RevisaoStepProps {
  formData: CampanhaWithMessages;
}

// Status colors
const statusColors: Record<string, string> = {
  rascunho: "#6b7280",
  agendada: "#3b82f6",
  enviada: "#10b981",
  concluida: "#059669", 
  cancelada: "#ef4444",
};

// Status labels
const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  agendada: "Agendada",
  enviada: "Enviada",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

// Target labels
const targetLabels: Record<string, string> = {
  all: "Todos os contatos",
  tags: "Por tags",
  contacts: "Contatos específicos",
  custom: "Personalizado",
};

export function RevisaoStep({ formData }: RevisaoStepProps) {
  const { contatos, tags } = useContatos();

  // Formatar bytes para exibição amigável
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Formatar datas
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Não definida";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Data inválida";
    }
  };

  // Renderizar contatos selecionados
  const renderContactsList = () => {
    if (!formData.contactIds || formData.contactIds.length === 0) {
      return (
        <div className="text-muted-foreground text-sm">
          Nenhum contato selecionado
        </div>
      );
    }
    
    const selectedContacts = formData.contactIds
      .map(id => contatos.find(contato => contato.id === id))
      .filter(Boolean);
    
    if (selectedContacts.length === 0) {
      return (
        <div className="text-muted-foreground text-sm">
          Nenhum contato encontrado
        </div>
      );
    }
    
    return (
      <ScrollArea className="h-[200px] w-full border rounded-md p-4">
        <div className="space-y-2">
          {selectedContacts.map(contato => contato && (
            <div key={contato.id} className="p-2 rounded-md bg-muted/30">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {contato.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-sm font-medium">{contato.name}</span>
                  {contato.phone && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {contato.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };
  
  // Renderizar tags selecionadas de forma compacta
  const renderTagsList = () => {
    if (!formData.tagIds || formData.tagIds.length === 0) {
      return <span className="text-muted-foreground">Nenhuma tag</span>;
    }
    
    const selectedTags = formData.tagIds.map(id => 
      tags.find(tag => tag.id === id)
    ).filter(Boolean);
    
    if (selectedTags.length === 0) {
      return <span className="text-muted-foreground">Nenhuma tag</span>;
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {selectedTags.map(tag => tag && (
          <Badge 
            key={tag.id} 
            style={{ backgroundColor: tag.color }} 
            className="text-white"
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    );
  };

  // Renderizar preview de mensagens
  const renderMessagePreview = () => {
    if (!formData.content && (!formData.mediaAttachments || formData.mediaAttachments.length === 0) && (!formData.messages || formData.messages.length === 0)) {
      return (
        <div className="text-muted-foreground p-4 text-center">
          <p>Nenhuma mensagem definida</p>
        </div>
      );
    }
    
    const hasMensagens = formData.messages && formData.messages.length > 0;
    
    if (!hasMensagens && formData.content) {
      return (
        <MensagemPreview
          content={""}
          mediaFiles={formData.mediaAttachments?.map((media, index) => ({
            id: `media-${index}`,
            type: media.type as "image" | "audio" | "video" | "file",
            url: media.url || "",
            name: media.name,
            size: media.size
          })) || []}
          messages={[{
            id: "single-message",
            content: formData.content,
            mediaFiles: formData.mediaAttachments?.map((media, index) => ({
              id: `media-${index}`,
              type: media.type as "image" | "audio" | "video" | "file",
              url: media.url || "",
              name: media.name,
              size: media.size
            }))
          }]}
          className="w-full"
          autoAddMessage={false}
          readOnly={true}
          onAddButtonClick={undefined}
          onClearButtonClick={undefined}
        />
      );
    }
    
    if (hasMensagens && formData.messages && formData.messages.length > 0) {
      return (
        <MensagemPreview
          content={""}
          mediaFiles={[]}
          messages={formData.messages.map((mensagem, index) => ({
            id: `message-${index}`,
            content: mensagem.content || "",
            mediaFiles: mensagem.mediaFiles?.map((file, i) => ({
              id: file.id || `media-${index}-${i}`,
              type: file.type as "image" | "audio" | "video" | "file",
              url: file.url || "",
              name: file.name,
              size: file.size
            })) || []
          }))}
          className="w-full"
          autoAddMessage={false}
          readOnly={true}
          onAddButtonClick={undefined}
          onClearButtonClick={undefined}
        />
      );
    }
    
    return (
      <div className="text-muted-foreground p-4 text-center">
        <p>Nenhuma mensagem definida</p>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-border">
            {/* Coluna 1: Informações Básicas */}
            <div className="p-4 space-y-3">
              <h3 className="font-medium flex items-center text-sm">
                <Info className="h-4 w-4 mr-2 text-primary" /> 
                Informações
              </h3>
              
              <div>
                <h4 className="text-xs text-muted-foreground">Título</h4>
                <p className="font-medium">{formData.title || "Sem título"}</p>
              </div>
              
              <div>
                <h4 className="text-xs text-muted-foreground">Status</h4>
                <Badge 
                  style={{ backgroundColor: statusColors[formData.status || "rascunho"] }}
                  className="text-white font-normal mt-1"
                >
                  {statusLabels[formData.status || "rascunho"]}
                </Badge>
              </div>
              
              <div>
                <h4 className="text-xs text-muted-foreground">Data de Início</h4>
                <div className="flex items-center text-sm mt-1">
                  <CalendarDays className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <span>{formatDate(formData.startDate)}</span>
                </div>
              </div>
              
              {formData.description && (
                <div>
                  <h4 className="text-xs text-muted-foreground">Descrição</h4>
                  <p className="text-sm text-muted-foreground">{formData.description}</p>
                </div>
              )}
            </div>
            
            {/* Coluna 2: Público */}
            <div className="p-4 space-y-3">
              <h3 className="font-medium flex items-center text-sm">
                <Target className="h-4 w-4 mr-2 text-primary" /> 
                Público-Alvo
              </h3>
              
              <div>
                <h4 className="text-xs text-muted-foreground">Tipo de Seleção</h4>
                <p className="text-sm mt-1">{targetLabels[formData.target || "all"]}</p>
              </div>
              
              {formData.target === "tags" && (
                <div>
                  <h4 className="text-xs text-muted-foreground">Tags</h4>
                  <div className="mt-1">{renderTagsList()}</div>
                </div>
              )}
              
              {formData.target === "contacts" && (
                <div>
                  <h4 className="text-xs text-muted-foreground">Contatos</h4>
                  <p className="text-sm mt-1">
                    {formData.contactIds?.length || 0} contatos selecionados
                  </p>
                </div>
              )}
            </div>
            
            {/* Coluna 3: Preview da Mensagem */}
            <div className="p-4 space-y-3">
              <h3 className="font-medium flex items-center text-sm">
                <Megaphone className="h-4 w-4 mr-2 text-primary" /> 
                Mensagem
              </h3>
              
              <div className="border rounded overflow-hidden bg-gray-50 max-h-[350px]">
                <ScrollArea className="h-[350px]">
                  <div className="p-2">
                    {renderMessagePreview()}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 