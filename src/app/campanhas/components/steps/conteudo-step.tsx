"use client";

import { Campanha } from "@/contexts/campanhasContext";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquareText, ImageIcon, Paperclip, Info, EyeIcon } from "lucide-react";
import { MediaUpload, MediaFile } from "@/components/custom/media-upload";
import { MensagemPreview } from "@/components/custom/mensagem-preview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ConteudoStepProps {
  formData: Partial<Campanha>;
  updateFormData: (data: Partial<Campanha>) => void;
}

export function ConteudoStep({ formData, updateFormData }: ConteudoStepProps) {
  const [content, setContent] = useState(formData.content || "");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [activeTab, setActiveTab] = useState<string>("edit");
  
  // Atualizar o formData central quando o conteúdo mudar
  useEffect(() => {
    // Apenas atualizar se o conteúdo for diferente do que já está no formData
    if (content !== formData.content) {
      updateFormData({ 
        content,
        // Adicionar informações sobre mídia (que seriam salvas em um banco de dados real)
        mediaAttachments: mediaFiles.map(file => ({
          type: file.type,
          name: file.name,
          size: file.size,
          // Em um caso real, aqui seria o ID ou URL do arquivo após upload para um serviço de armazenamento
        }))
      });
    }
  }, [content, formData.content, mediaFiles, updateFormData]);
  
  const handleAddMedia = (file: MediaFile) => {
    setMediaFiles(prev => [...prev, file]);
    setActiveTab("edit"); // Voltar para a aba de edição após adicionar mídia
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
  
  const variableTags = [
    { tag: "{nome}", description: "Nome do contato" },
    { tag: "{sobrenome}", description: "Sobrenome do contato" },
    { tag: "{email}", description: "Email do contato" },
    { tag: "{telefone}", description: "Telefone do contato" },
  ];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center text-base font-medium">
                <MessageSquareText className="h-4 w-4 mr-2 text-primary" />
                Editor de Mensagem
              </CardTitle>
              <CardDescription>
                Escreva o conteúdo da sua mensagem
              </CardDescription>
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
              
              <div className="mt-4 text-sm text-muted-foreground border-t pt-4">
                <p className="font-medium mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-1" />
                  Dicas de formatação:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Use variáveis como <code className="bg-muted px-1 py-0.5 rounded">{"{nome}"}</code> para personalizar sua mensagem</li>
                  <li>Evite textos muito longos para maior engajamento</li>
                  <li>Inclua uma chamada clara para ação</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center text-base font-medium">
                <Paperclip className="h-4 w-4 mr-2 text-primary" />
                Anexos e Mídia
              </CardTitle>
              <CardDescription>
                Adicione imagens, áudios ou arquivos à sua mensagem
              </CardDescription>
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
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-base font-medium">
                  <EyeIcon className="h-4 w-4 mr-2 text-primary" />
                  Visualização da Mensagem
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setActiveTab(activeTab === "edit" ? "preview" : "edit")}
                  className="text-xs"
                >
                  {activeTab === "edit" ? "Tela Cheia" : "Reduzir"}
                </Button>
              </div>
              <CardDescription>
                Veja como sua mensagem vai aparecer para os contatos
              </CardDescription>
            </CardHeader>
            <CardContent className={`p-4 flex justify-center ${activeTab === "preview" ? "lg:h-[500px]" : ""}`}>
              <div className={`${activeTab === "preview" ? "scale-110 transition-transform duration-300" : ""}`}>
                <MensagemPreview 
                  content={content} 
                  mediaFiles={mediaFiles.map(file => ({
                    type: file.type,
                    url: file.url,
                    name: file.name,
                    size: file.size
                  }))}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/40">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium mb-2">Status do Conteúdo</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Texto:</span>
                  <span className={`text-sm font-medium ${content ? "text-green-600" : "text-amber-500"}`}>
                    {content ? "Preenchido" : "Pendente"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Anexos:</span>
                  <span className="text-sm font-medium">
                    {mediaFiles.length > 0 ? `${mediaFiles.length} arquivo(s)` : "Nenhum (opcional)"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tamanho da mensagem:</span>
                  <span className="text-sm font-medium">
                    {content.length} caracteres
                  </span>
                </div>
              </div>
              
              {!content && (
                <div className="mt-4 bg-amber-100 text-amber-700 p-2 rounded-md text-xs">
                  É necessário adicionar algum conteúdo para sua mensagem antes de continuar.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 