"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, FileAudioIcon, FileVideoIcon, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type MediaFile = {
  type: "image" | "audio" | "video" | "file";
  url: string;
  name: string;
  size: string;
  file: File;
};

interface MediaUploadProps {
  onAddMedia: (file: MediaFile) => void;
  onRemoveMedia: (index: number) => void;
  mediaFiles: MediaFile[];
  className?: string;
}

export function MediaUpload({ onAddMedia, onRemoveMedia, mediaFiles, className }: MediaUploadProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "audio" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Criar URL para preview
    const url = URL.createObjectURL(file);
    
    // Formatar tamanho do arquivo
    const sizeKB = file.size / 1024;
    const sizeMB = sizeKB / 1024;
    const sizeFormatted = sizeMB >= 1 
      ? `${sizeMB.toFixed(1)} MB` 
      : `${Math.ceil(sizeKB)} KB`;
    
    onAddMedia({
      type,
      url,
      name: file.name,
      size: sizeFormatted,
      file
    });
    
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    e.target.value = "";
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => imageInputRef.current?.click()}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Imagem
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => audioInputRef.current?.click()}
        >
          <FileAudioIcon className="h-4 w-4 mr-2" />
          Áudio
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => videoInputRef.current?.click()}
        >
          <FileVideoIcon className="h-4 w-4 mr-2" />
          Vídeo
        </Button>
        
        <input
          type="file"
          ref={imageInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "image")}
        />
        
        <input
          type="file"
          ref={audioInputRef}
          className="hidden"
          accept="audio/*"
          onChange={(e) => handleFileChange(e, "audio")}
        />
        
        <input
          type="file"
          ref={videoInputRef}
          className="hidden"
          accept="video/*"
          onChange={(e) => handleFileChange(e, "video")}
        />
      </div>
      
      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {mediaFiles.map((file, index) => (
            <div key={index} className="relative border rounded-md overflow-hidden bg-muted/30">
              {file.type === "image" && (
                <div className="aspect-square relative">
                  <img 
                    src={file.url} 
                    alt={file.name} 
                    className="object-cover h-full w-full"
                  />
                </div>
              )}
              
              {file.type === "audio" && (
                <div className="p-2 h-full flex flex-col">
                  <FileAudioIcon className="h-8 w-8 mx-auto mb-2" />
                  <audio src={file.url} controls className="w-full mt-auto" />
                </div>
              )}
              
              {file.type === "video" && (
                <div className="aspect-video">
                  <video 
                    src={file.url} 
                    controls 
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-1 text-xs truncate">{file.name}</div>
              <div className="absolute top-1 right-1">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={() => onRemoveMedia(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 