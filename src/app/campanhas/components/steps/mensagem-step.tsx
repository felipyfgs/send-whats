"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Campanha } from "@/contexts/campanhasContext";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquareText, ImageIcon, Paperclip, Info, EyeIcon, MonitorIcon, PlusCircle, ArrowRight } from "lucide-react";
import { MediaUpload, MediaFile } from "@/components/custom/media-upload";
import { MensagemPreview } from "@/components/custom/mensagem-preview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Estender a interface Campanha para incluir mensagens
interface CampanhaWithMessages extends Partial<Campanha> {
  messages?: any[];
  currentMessage?: {
    content: string;
    mediaFiles: Array<{
      type: string;
      url: string;
      name: string;
      size?: string;
    }>;
  };
}

interface MensagemStepProps {
  formData: CampanhaWithMessages;
  updateFormData: (data: Partial<CampanhaWithMessages>) => void;
}

export function MensagemStep({ formData, updateFormData }: MensagemStepProps) {
  const [content, setContent] = useState(formData.content || "");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [mensagens, setMensagens] = useState<any[]>(formData.messages || []);
  const [mensagemAtual, setMensagemAtual] = useState<any>(null);
  
  const handleAddMedia = (file: MediaFile) => {
    setMediaFiles(prev => [...prev, file]);
  };
  
  const handleRemoveMedia = (index: number) => {
    setMediaFiles(prev => {
      const newFiles = [...prev];
      // Liberar o URL do objeto para evitar vazamento de memória
      URL.revokeObjectURL(newFiles[index].url);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };
  
  // Atualizar a mensagem atual para preview
  useEffect(() => {
    // Criar uma mensagem atual para preview apenas se tiver conteúdo ou arquivos
    if (content.trim() || mediaFiles.length > 0) {
      setMensagemAtual({
        id: 'current',
        content,
        mediaFiles: mediaFiles.map(file => ({
          type: file.type,
          url: file.url,
          name: file.name,
          size: file.size
        }))
      });
    } else {
      setMensagemAtual(null);
    }
  }, [content, mediaFiles]);
  
  // Adicionar a mensagem atual à lista de mensagens
  const handleAddNewMessage = () => {
    if (content.trim() || mediaFiles.length > 0) {
      // Criar nova mensagem para adicionar à lista
      const newMessage = {
        id: Date.now().toString(),
        content,
        mediaFiles: mediaFiles.map(file => ({
          type: file.type,
          url: file.url,
          name: file.name,
          size: file.size
        }))
      };
      
      // Adicionar à lista de mensagens
      setMensagens(prev => [...prev, newMessage]);
      
      // Limpar campos para a próxima mensagem
      setContent("");
      setMediaFiles([]);
      setMensagemAtual(null);
    } else {
      toast.error("Adicione algum conteúdo ou anexo antes de criar uma nova mensagem");
    }
  };
  
  // Remover uma mensagem da lista
  const handleRemoveMessage = (index: number) => {
    setMensagens(prev => prev.filter((_, i) => i !== index));
  };
  
  // Salvar mensagens no formData apenas quando o componente for desmontado ou próximo é clicado
  useEffect(() => {
    return () => {
      // Salvar mensagens quando o componente for desmontado (navegação para outro passo)
      const currentContent = content.trim() || mediaFiles.length > 0;
      
      // Adicionar mensagem atual às mensagens salvas, se existir conteúdo
      let mensagensFinais = [...mensagens];
      if (currentContent) {
        mensagensFinais.push({
          id: Date.now().toString(),
          content,
          mediaFiles: mediaFiles.map(file => ({
            type: file.type,
            url: file.url,
            name: file.name,
            size: file.size
          }))
        });
      }
      
      updateFormData({
        content,
        messages: mensagensFinais,
        mediaAttachments: mediaFiles.map(file => ({
          type: file.type,
          name: file.name,
          size: file.size,
        }))
      });
    };
  }, [content, mediaFiles, mensagens, updateFormData]);
  
  // Função para salvar manualmente (antes de avançar)
  const saveMessages = () => {
    const currentContent = content.trim() || mediaFiles.length > 0;
    
    // Adicionar mensagem atual às mensagens salvas, se existir conteúdo
    let mensagensFinais = [...mensagens];
    if (currentContent) {
      mensagensFinais.push({
        id: Date.now().toString(),
        content,
        mediaFiles: mediaFiles.map(file => ({
          type: file.type,
          url: file.url,
          name: file.name,
          size: file.size
        }))
      });
      
      // Limpar campos após salvar
      setContent("");
      setMediaFiles([]);
      setMensagemAtual(null);
    }
    
    updateFormData({
      content: "",
      messages: mensagensFinais
    });
    
    return mensagensFinais.length > 0;
  };
  
  const variableTags = [
    { tag: "{nome}", description: "Nome do contato" },
    { tag: "{sobrenome}", description: "Sobrenome do contato" },
    { tag: "{email}", description: "Email do contato" },
    { tag: "{telefone}", description: "Telefone do contato" },
  ];
  
  // Juntar mensagens já adicionadas com a mensagem atual para o preview
  const getPreviewMessages = () => {
    // Sempre mostrar todas as mensagens salvas
    const result = [...mensagens];
    
    // Adicionar a mensagem atual sendo digitada, se existir
    if ((content.trim() || mediaFiles.length > 0) && mensagemAtual) {
      result.push(mensagemAtual);
    }
    
    return result;
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center text-base font-medium">
                <MessageSquareText className="h-4 w-4 mr-2 text-primary" />
                Escreva sua mensagem
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <Textarea
                placeholder="Digite o conteúdo da sua mensagem..."
                className="min-h-[200px] resize-none font-medium"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              
              <div className="flex flex-wrap gap-2 mt-3">
                {variableTags.map((variable) => (
                  <Button
                    key={variable.tag}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setContent(prev => prev + " " + variable.tag)}
                    className="text-xs"
                  >
                    {variable.tag}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center text-base font-medium">
                <Paperclip className="h-4 w-4 mr-2 text-primary" />
                Anexos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <MediaUpload 
                onAddMedia={handleAddMedia} 
                onRemoveMedia={handleRemoveMedia}
                mediaFiles={mediaFiles}
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-base font-medium">
                  <EyeIcon className="h-4 w-4 mr-2 text-primary" />
                  Visualização da Mensagem
                </CardTitle>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MonitorIcon className="h-4 w-4" />
                  <span className="text-xs">Desktop</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <MensagemPreview
                content={content}
                mediaFiles={mediaFiles}
                className="w-full"
                messages={mensagens}
                autoAddMessage={true}
                onAddButtonClick={handleAddNewMessage}
                onClearButtonClick={() => {
                  setContent("");
                  setMediaFiles([]);
                  setMensagens([]);
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 