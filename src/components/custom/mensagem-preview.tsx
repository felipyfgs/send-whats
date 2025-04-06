"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Check, CheckCheck, File } from "lucide-react";
import Image from "next/image";

export interface MensagemPreviewProps {
  content: string;
  mediaFiles?: {
    id?: string;
    type: "image" | "audio" | "video" | "file";
    url: string;
    name: string;
    size?: string;
  }[];
  className?: string;
  autoAddMessage?: boolean;
  onAddButtonClick?: () => void;
  onClearButtonClick?: () => void;
  readOnly?: boolean;
  messages?: Array<{
    id?: string;
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

// Interface para mensagens na conversa
interface Mensagem {
  id: string;
  content: string;
  time: string;
  readStatus: "sent" | "delivered" | "read";
  mediaFiles: {
    id?: string;
    type: "image" | "audio" | "video" | "file";
    url: string;
    name: string;
    size?: string;
  }[];
}

// Interface para o ref do MensagemPreview
export interface MensagemPreviewRef {
  adicionarMensagem: () => void;
  limparMensagens: () => void;
  setContent: (content: string) => void;
  setMediaFiles: (files: any[]) => void;
}

export const MensagemPreview = forwardRef<MensagemPreviewRef, MensagemPreviewProps>((props, ref) => {
  const { 
    content: initialContent, 
    mediaFiles: initialMediaFiles = [], 
    className, 
    autoAddMessage = false,
    onAddButtonClick,
    onClearButtonClick,
    readOnly = false,
    messages: externalMessages
  } = props;
  
  const [content, setContent] = useState(initialContent);
  const [mediaFiles, setMediaFiles] = useState(initialMediaFiles);
  const [readStatus, setReadStatus] = useState<"sent" | "delivered" | "read">("read");
  
  // State para armazenar múltiplas mensagens
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  
  // State para controle de edição
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEditado, setTextoEditado] = useState("");
  
  // Adicionar state para controlar a gravação de áudio
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  
  // Adicionar state para controle de reprodução de áudio
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  
  // Formato de hora atual
  const currentTime = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Atualizar content e mediaFiles quando as props mudarem
  useEffect(() => {
    setContent(initialContent);
    setMediaFiles(initialMediaFiles);
  }, [initialContent, initialMediaFiles]);
  
  // Atualizar mensagens quando external messages mudar
  useEffect(() => {
    let mensagensAtualizadas: Mensagem[] = [];
    
    // Se tiver mensagens externas, adicionar à lista
    if (externalMessages && externalMessages.length > 0) {
      // Converter do formato externo para o formato interno
      const convertedMessages = externalMessages.map((msg): Mensagem => ({
        id: msg.id || generateUniqueId(),
        content: msg.content || "",
        time: currentTime,
        readStatus: "read",
        mediaFiles: msg.mediaFiles ? 
          msg.mediaFiles.map(file => ({
            id: file.id || generateUniqueId(),
            type: file.type,
            url: file.url,
            name: file.name,
            size: file.size
          })) : []
      }));
      
      mensagensAtualizadas = [...convertedMessages];
    }
    
    // Se o usuário estiver digitando, adicionar a mensagem atual ao final
    // apenas se não estiver usando autoAddMessage (para evitar duplicação)
    if ((content || mediaFiles.length > 0) && !autoAddMessage) {
      const mediaFilesWithIds = mediaFiles.map(file => {
        if (!file.id) {
          return { ...file, id: generateUniqueId() };
        }
        return file;
      });
      
      // Adicionar a mensagem que está sendo digitada no final
      mensagensAtualizadas.push({
        id: 'preview-message',
        content,
        time: currentTime,
        readStatus,
        mediaFiles: mediaFilesWithIds
      });
    }
    
    // Atualizar estado de mensagens
    setMensagens(mensagensAtualizadas);
  }, [externalMessages, content, mediaFiles, currentTime, readStatus, autoAddMessage]);
  
  // Efeito para atualizar mensagem automática no preview
  useEffect(() => {
    // Apenas usar este efeito se NÃO existirem mensagens externas
    // E se autoAddMessage estiver habilitado
    if (autoAddMessage && (content || mediaFiles.length > 0) && (!externalMessages || externalMessages.length === 0)) {
      // Limpar mensagens anteriores
      setMensagens([]);
      
      // Adicionar nova mensagem ao preview
      const mediaFilesWithIds = mediaFiles.map(file => {
        if (!file.id) {
          return { ...file, id: generateUniqueId() };
        }
        return file;
      });
      
      const novaMensagem: Mensagem = {
        id: 'preview-message',
        content,
        time: currentTime,
        readStatus,
        mediaFiles: mediaFilesWithIds
      };
      
      setMensagens([novaMensagem]);
    }
  }, [autoAddMessage, content, mediaFiles, currentTime, readStatus, externalMessages]);
  
  // Expor métodos para uso via ref
  useImperativeHandle(ref, () => ({
    adicionarMensagem: () => {
      console.log("adicionarMensagem chamado", content, mediaFiles);
      adicionarMensagem();
    },
    limparMensagens: () => {
      console.log("limparMensagens chamado");
      setMensagens([]);
    },
    setContent: (text: string) => {
      console.log("setContent chamado", text);
      setContent(text);
    },
    setMediaFiles: (files: any[]) => {
      console.log("setMediaFiles chamado", files);
      setMediaFiles(files);
    }
  }));
  
  // Função para gerar ID único
  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };
  
  // Função para adicionar uma nova mensagem
  const adicionarMensagem = () => {
    if (!content && mediaFiles.length === 0) {
      console.log("Tentativa de adicionar mensagem vazia");
      return;
    }
    
    // Adicionar IDs únicos para arquivos de mídia, se não existirem
    const mediaFilesWithIds = mediaFiles.map(file => {
      if (!file.id) {
        return { ...file, id: generateUniqueId() };
      }
      return file;
    });
    
    const novaMensagem: Mensagem = {
      id: generateUniqueId(),
      content,
      time: currentTime,
      readStatus,
      mediaFiles: mediaFilesWithIds
    };
    
    console.log("Adicionando nova mensagem:", novaMensagem);
    
    setMensagens([...mensagens, novaMensagem]);
  };
  
  // Função para deletar uma mensagem
  const deletarMensagem = (id: string) => {
    setMensagens(mensagens.filter(msg => msg.id !== id));
  };
  
  // Função para iniciar a edição de uma mensagem
  const iniciarEdicao = (mensagem: Mensagem) => {
    setEditandoId(mensagem.id);
    setTextoEditado(mensagem.content);
  };
  
  // Função para salvar edição
  const salvarEdicao = () => {
    if (!editandoId) return;
    
    setMensagens(mensagens.map(msg => 
      msg.id === editandoId 
        ? {...msg, content: textoEditado, time: `${currentTime} (editada)`} 
        : msg
    ));
    
    setEditandoId(null);
    setTextoEditado("");
  };
  
  // Função para cancelar edição
  const cancelarEdicao = () => {
    setEditandoId(null);
    setTextoEditado("");
  };
  
  // Função para mover uma mensagem para cima
  const moverParaCima = (index: number) => {
    if (index <= 0) return;
    
    const novasMensagens = [...mensagens];
    const temp = novasMensagens[index];
    novasMensagens[index] = novasMensagens[index - 1];
    novasMensagens[index - 1] = temp;
    
    setMensagens(novasMensagens);
  };
  
  // Função para mover uma mensagem para baixo
  const moverParaBaixo = (index: number) => {
    if (index >= mensagens.length - 1) return;
    
    const novasMensagens = [...mensagens];
    const temp = novasMensagens[index];
    novasMensagens[index] = novasMensagens[index + 1];
    novasMensagens[index + 1] = temp;
    
    setMensagens(novasMensagens);
  };
  
  // Função para simular início da gravação
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    // Timer para simular contagem de tempo de gravação
    const timer = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    // Guardar referência do timer no componente
    return () => clearInterval(timer);
  };
  
  // Função para simular parada da gravação
  const stopRecording = () => {
    setIsRecording(false);
    // Em uma implementação real, aqui seria salvo o áudio gravado
    setAudioURL("audio-simulado.mp3");
  };
  
  // Função para formatar o texto com todos os estilos do WhatsApp
  const formatText = (text: string) => {
    if (!text) return null;
    
    // Processa o texto linha por linha para listas e citações
    const lines = text.split('\n');
    const formattedLines = lines.map((line, lineIndex) => {
      // Verificar citações
      if (line.startsWith('> ')) {
        return (
          <div key={`quote-${lineIndex}`} className="pl-2 border-l-4 border-gray-400 italic text-gray-700 my-1">
            {formatInlineStyles(line.substring(2))}
          </div>
        );
      }
      
      // Verificar listas com marcadores
      if (line.match(/^[\*\-]\s+/)) {
        return (
          <div key={`bullet-${lineIndex}`} className="flex items-baseline gap-2 my-0.5">
            <span className="text-gray-700">•</span>
            <span>{formatInlineStyles(line.substring(2))}</span>
          </div>
        );
      }
      
      // Verificar listas numeradas
      const numListMatch = line.match(/^(\d+)\.\s+(.+)/);
      if (numListMatch) {
        return (
          <div key={`num-${lineIndex}`} className="flex items-baseline gap-2 my-0.5">
            <span className="text-gray-700 min-w-[1.5em]">{numListMatch[1]}.</span>
            <span>{formatInlineStyles(numListMatch[2])}</span>
          </div>
        );
      }
      
      // Código de bloco (três acentos graves)
      if (line.startsWith('```') && line.endsWith('```') && line.length > 6) {
        const code = line.substring(3, line.length - 3);
        return (
          <pre key={`codeblock-${lineIndex}`} className="bg-gray-100 p-2 rounded-md font-mono text-xs text-gray-800 my-1 overflow-x-auto">
            {code}
          </pre>
        );
      }
      
      // Linha normal com estilos inline
      return <div key={`line-${lineIndex}`}>{formatInlineStyles(line)}</div>;
    });
    
    return formattedLines;
  };
  
  // Função para processar estilos inline (negrito, itálico, tachado, código)
  const formatInlineStyles = (text: string) => {
    if (!text) return null;
    
    let processedText = text;
    const parts = [];
    
    // Expressão regular para capturar todos os estilos inline
    const regexPatterns = [
      { pattern: /\*([^*]+)\*/g, type: 'bold' },         // *texto* (negrito)
      { pattern: /_([^_]+)_/g, type: 'italic' },         // _texto_ (itálico)
      { pattern: /~([^~]+)~/g, type: 'strikethrough' },  // ~texto~ (tachado)
      { pattern: /`([^`]+)`/g, type: 'code' },           // `texto` (código inline)
    ];
    
    // Definir tipo para a correspondência
    type Match = {
      start: number;
      end: number;
      content: string;
      fullMatch: string;
      type: 'bold' | 'italic' | 'strikethrough' | 'code';
    };
    
    // Encontrar todas as correspondências e suas posições
    const matches: Match[] = [];
    
    regexPatterns.forEach(({pattern, type}) => {
      let match;
      while ((match = pattern.exec(processedText)) !== null) {
        matches.push({
          start: match.index,
          end: pattern.lastIndex,
          content: match[1],
          fullMatch: match[0],
          type: type as Match['type']
        });
      }
    });
    
    // Ordenar por posição de início
    matches.sort((a, b) => a.start - b.start);
    
    // Filtrar sobreposições (priorizar a primeira correspondência)
    const filteredMatches = [];
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      let overlapping = false;
      
      for (let j = 0; j < filteredMatches.length; j++) {
        const previous = filteredMatches[j];
        if (current.start < previous.end && current.start >= previous.start) {
          overlapping = true;
          break;
        }
      }
      
      if (!overlapping) {
        filteredMatches.push(current);
      }
    }
    
    // Construir o resultado
    let lastIndex = 0;
    filteredMatches.forEach((match, index) => {
      if (match.start > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {processedText.substring(lastIndex, match.start)}
          </span>
        );
      }
      
      switch (match.type) {
        case 'bold':
          parts.push(
            <strong key={`bold-${index}`} className="font-extrabold text-black">
              {match.content}
            </strong>
          );
          break;
        case 'italic':
          parts.push(
            <em key={`italic-${index}`} className="italic">
              {match.content}
            </em>
          );
          break;
        case 'strikethrough':
          parts.push(
            <span key={`strike-${index}`} className="line-through">
              {match.content}
            </span>
          );
          break;
        case 'code':
          parts.push(
            <code key={`code-${index}`} className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">
              {match.content}
            </code>
          );
          break;
      }
      
      lastIndex = match.end;
    });
    
    if (lastIndex < processedText.length) {
      parts.push(
        <span key={`text-final`}>
          {processedText.substring(lastIndex)}
        </span>
      );
    }
    
    return parts.length > 0 ? parts : processedText;
  };
  
  // Formatar o tempo de gravação
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Função para lidar com play/pause de áudio
  const toggleAudioPlay = (audioId: string) => {
    if (playingAudioId === audioId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(audioId);
    }
  };

  // Renderização de componente de áudio
  const renderAudioPlayer = (audioUrl: string, audioId: string | undefined, duration: string = "0:11") => {
    // Garante que sempre temos um ID válido
    const safeAudioId = audioId || audioUrl;
    const isPlaying = playingAudioId === safeAudioId;
    
    return (
      <div className="rounded-md flex items-center space-x-2 mb-1 bg-[#005c4b] py-1 px-2 w-full max-w-[200px]">
        <button 
          onClick={() => toggleAudioPlay(safeAudioId)}
          className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center flex-shrink-0"
        >
          {isPlaying ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M10 4H6v16h4V4zm8 0h-4v16h4V4z" fill="white" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M5 3l14 9-14 9V3z" fill="white" />
            </svg>
          )}
        </button>
        
        <div className="flex-1">
          <div className="h-[3px] bg-[#2e7a73] rounded-full w-full">
            <div className="h-full bg-white rounded-full" style={{ width: isPlaying ? '60%' : '0%' }}></div>
          </div>
        </div>
        
        <div className="text-[10px] text-white/80 flex-shrink-0">{duration}</div>
      </div>
    );
  };
  
  // Renderizar botões de ação (apenas se não estiver em modo somente leitura)
  const renderActionButtons = () => {
    // Não renderizar botões se estiver em modo somente leitura
    if (readOnly) return null;
    
    return (
      <div className="flex justify-between mt-4 space-x-2">
        {onAddButtonClick && (
          <button
            type="button"
            onClick={onAddButtonClick}
            className="text-white bg-green-500 hover:bg-green-600 transition-colors py-2 px-4 rounded-full flex-1 flex items-center justify-center"
          >
            <span className="text-sm">Adicionar</span>
          </button>
        )}
        
        {onClearButtonClick && (
          <button
            type="button"
            onClick={onClearButtonClick}
            className="text-white bg-red-500 hover:bg-red-600 transition-colors py-2 px-4 rounded-full flex-1 flex items-center justify-center"
          >
            <span className="text-sm">Limpar</span>
          </button>
        )}
      </div>
    );
  };
  
  // Renderizar mensagem individual no formato WhatsApp
  const renderMensagem = (mensagem: Mensagem, index: number) => {
    return (
      <div key={mensagem.id} className="flex justify-end group relative mb-4">
        {/* Controles de ordenação na lateral esquerda (apenas se não estiver em modo readOnly) */}
        {!readOnly && (
          <div className="absolute -left-9 top-1/2 transform -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => moverParaCima(index)} 
              disabled={index === 0}
              className="bg-gray-200 rounded-full p-1 text-gray-600 hover:bg-gray-300 transition-colors disabled:opacity-30"
              title="Mover para cima"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M12 19V5M12 5l7 7M12 5l-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              onClick={() => moverParaBaixo(index)} 
              disabled={index === mensagens.length - 1}
              className="bg-gray-200 rounded-full p-1 text-gray-600 hover:bg-gray-300 transition-colors disabled:opacity-30"
              title="Mover para baixo"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M12 19l7-7M12 19l-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
        
        {editandoId === mensagem.id && !readOnly ? (
          // Modo de edição (apenas se não estiver em modo readOnly)
          <div className="bg-white rounded-lg p-2 shadow-sm w-full max-w-[80%] border-2 border-[#25d366]">
            <textarea
              value={textoEditado}
              onChange={(e) => setTextoEditado(e.target.value)}
              className="w-full p-2 text-sm font-medium text-gray-800 border rounded resize-none focus:outline-none focus:ring-1 focus:ring-[#25d366] min-h-[60px]"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button 
                onClick={cancelarEdicao} 
                className="bg-gray-200 text-gray-800 rounded px-3 py-1 text-xs font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={salvarEdicao} 
                className="bg-[#25d366] text-white rounded px-3 py-1 text-xs font-medium"
              >
                Salvar
              </button>
            </div>
          </div>
        ) : (
          // Visualização normal
          <div className="bg-[#d9fdd3] rounded-lg p-2 shadow-sm max-w-[80%] text-black relative group">
            {/* Botões de ação - sobrepostos e visíveis apenas ao passar o mouse (apenas se não estiver em modo readOnly) */}
            {!readOnly && (
              <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => iniciarEdicao(mensagem)} 
                  className="bg-blue-500 rounded-full p-1 text-white hover:bg-blue-600 transition-colors"
                  title="Editar mensagem"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button 
                  onClick={() => deletarMensagem(mensagem.id)} 
                  className="bg-red-500 rounded-full p-1 text-white hover:bg-red-600 transition-colors"
                  title="Deletar mensagem"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
            
            {/* Renderizar arquivos de mídia, se existirem */}
            {renderMediaFilesContent(mensagem)}
            
            {/* Conteúdo de texto */}
            {mensagem.content && (
              <div className="text-sm font-medium text-gray-800 whitespace-pre-wrap break-words">
                {formatText(mensagem.content)}
              </div>
            )}
            
            <div className="text-[10px] text-gray-500 text-right mt-1 flex justify-end items-center gap-0.5">
              {mensagem.time}
              {mensagem.readStatus === "sent" && <Check className="h-3 w-3" />}
              {mensagem.readStatus === "delivered" && <Check className="h-3 w-3" />}
              {mensagem.readStatus === "read" && <CheckCheck className="h-3 w-3 text-[#53bdeb]" />}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Renderizar arquivos de mídia de uma mensagem
  const renderMediaFilesContent = (mensagem: Mensagem) => {
    if (!mensagem.mediaFiles || mensagem.mediaFiles.length === 0) {
      return null;
    }
    
    return (
      <>
        {mensagem.mediaFiles.map((file, index) => (
          <div key={index} className="mb-2">
            {file.type === "image" && (
              <div className="relative h-48 w-full rounded-md overflow-hidden mb-1">
                <Image 
                  src={file.url} 
                  alt={file.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            {file.type === "video" && (
              <div className="rounded-md overflow-hidden mb-1">
                <video 
                  src={file.url} 
                  controls 
                  className="w-full max-h-48"
                />
              </div>
            )}
            
            {file.type === "audio" && (
              renderAudioPlayer(file.url, file.id, file.size)
            )}
            
            {file.type === "file" && (
              <div className="flex items-center gap-2 bg-[#b3e7c9] rounded p-2 mb-1">
                <File className="h-5 w-5 text-gray-700" />
                <div className="flex-1 overflow-hidden">
                  <div className="text-xs font-medium text-gray-800 truncate">{file.name}</div>
                  {file.size && <div className="text-[10px] text-gray-600">{file.size}</div>}
                </div>
              </div>
            )}
          </div>
        ))}
      </>
    );
  };
  
  return (
    <div className={cn("relative max-w-sm mx-auto", className)}>
      {/* Moldura do celular */}
      <div className="relative bg-black rounded-[30px] shadow-xl p-2 pb-4 overflow-hidden">
        {/* Barra de status */}
        <div className="bg-black text-white p-2 px-6 flex justify-between items-center text-xs">
          <div>12:12</div>
          <div className="flex items-center space-x-2">
            <span className="i-lucide-bluetooth h-3 w-3" />
            <span className="i-lucide-signal h-3 w-3" />
            <span className="i-lucide-wifi h-3 w-3" />
            <span className="i-lucide-battery h-3 w-3" />
          </div>
        </div>
        
        {/* Tela do celular */}
        <div className="bg-[#ffffff] rounded-[28px] overflow-hidden flex flex-col h-[540px]">
          {/* Cabeçalho do WhatsApp */}
          <div className="flex items-center gap-2 p-2 bg-[#008069] text-white">
            <div className="flex items-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mr-3 text-white">
                <path d="M10 19L3 12M3 12L10 5M3 12L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <Avatar className="h-9 w-9 border-2 border-white/20">
                <div className="relative h-full w-full">
                  <Image 
                    src="/avatars/user.jpg" 
                    alt="Avatar do contato" 
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
              </Avatar>
            </div>
            <div className="flex-1 ml-2">
              <div className="text-sm font-medium">Felipe Galvão (você)</div>
              <div className="text-xs text-gray-100">Mensagem para mim</div>
            </div>
            <div className="flex items-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="20" r="2" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
          
          {/* Área de mensagens */}
          <div 
            className="flex-1 p-2 space-y-3 overflow-y-auto"
            style={{
              backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAUklEQVQ4y2NgGEbgPxQPFORnYCBUQToDA4OEohoDIwMDI4ocM5wsRZG7j2LQfwwt91HM+o/LJgEGBoYKBgbGCoLO+I/bEfgA44D7YhABAMK9Hcikl+7iAAAAAElFTkSuQmCC')",
              backgroundColor: "#efeae2"
            }}
          >
            {/* Exibir todas as mensagens salvas */}
            {mensagens.map((mensagem, index) => (
              <div key={mensagem.id} className="flex justify-end group relative mb-4">
                {/* Controles de ordenação na lateral esquerda (apenas se não estiver em modo readOnly) */}
                {!readOnly && (
                  <div className="absolute -left-9 top-1/2 transform -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => moverParaCima(index)} 
                      disabled={index === 0}
                      className="bg-gray-200 rounded-full p-1 text-gray-600 hover:bg-gray-300 transition-colors disabled:opacity-30"
                      title="Mover para cima"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M12 19V5M12 5l7 7M12 5l-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button 
                      onClick={() => moverParaBaixo(index)} 
                      disabled={index === mensagens.length - 1}
                      className="bg-gray-200 rounded-full p-1 text-gray-600 hover:bg-gray-300 transition-colors disabled:opacity-30"
                      title="Mover para baixo"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M12 19l7-7M12 19l-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                )}
                
                {editandoId === mensagem.id && !readOnly ? (
                  // Modo de edição (apenas se não estiver em modo readOnly)
                  <div className="bg-white rounded-lg p-2 shadow-sm w-full max-w-[80%] border-2 border-[#25d366]">
                    <textarea
                      value={textoEditado}
                      onChange={(e) => setTextoEditado(e.target.value)}
                      className="w-full p-2 text-sm font-medium text-gray-800 border rounded resize-none focus:outline-none focus:ring-1 focus:ring-[#25d366] min-h-[60px]"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button 
                        onClick={cancelarEdicao} 
                        className="bg-gray-200 text-gray-800 rounded px-3 py-1 text-xs font-medium"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={salvarEdicao} 
                        className="bg-[#25d366] text-white rounded px-3 py-1 text-xs font-medium"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  // Visualização normal
                  <div className="bg-[#d9fdd3] rounded-lg p-2 shadow-sm max-w-[80%] text-black relative group">
                    {/* Botões de ação - sobrepostos e visíveis apenas ao passar o mouse (apenas se não estiver em modo readOnly) */}
                    {!readOnly && (
                      <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => iniciarEdicao(mensagem)} 
                          className="bg-blue-500 rounded-full p-1 text-white hover:bg-blue-600 transition-colors"
                          title="Editar mensagem"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button 
                          onClick={() => deletarMensagem(mensagem.id)} 
                          className="bg-red-500 rounded-full p-1 text-white hover:bg-red-600 transition-colors"
                          title="Deletar mensagem"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    {/* Renderizar arquivos de mídia, se existirem */}
                    {renderMediaFilesContent(mensagem)}
                    
                    {/* Conteúdo de texto */}
                    {mensagem.content && (
                      <div className="text-sm font-medium text-gray-800 whitespace-pre-wrap break-words">
                        {formatText(mensagem.content)}
                      </div>
                    )}
                    
                    <div className="text-[10px] text-gray-500 text-right mt-1 flex justify-end items-center gap-0.5">
                      {mensagem.time}
                      {mensagem.readStatus === "sent" && <Check className="h-3 w-3" />}
                      {mensagem.readStatus === "delivered" && <Check className="h-3 w-3" />}
                      {mensagem.readStatus === "read" && <CheckCheck className="h-3 w-3 text-[#53bdeb]" />}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Barra discreta para adicionar mensagens */}
          <div className="flex items-center justify-center p-2 bg-[#f0f2f5]">
            {renderActionButtons()}
          </div>
          
          {/* Barra de entrada de mensagem (apenas se não estiver em modo readOnly) */}
          {!readOnly && (
            <div className="flex items-center gap-2 p-2 bg-[#f0f2f5]">
              {!isRecording ? (
                <>
                  <div className="flex-1 bg-white rounded-full py-2 px-4 text-sm text-gray-500 flex items-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-500 mr-2">
                      <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
                    </svg>
                    {audioURL ? 'Áudio gravado 👍' : 'Digite uma mensagem'}
                  </div>
                  <button 
                    className="rounded-full p-3 bg-[#00a884] text-white flex items-center justify-center"
                    onClick={() => !audioURL && startRecording()}
                  >
                    {audioURL ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                        <path d="M5 12l5 5 9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </>
              ) : (
                // Interface de gravação
                <div className="flex-1 bg-white rounded-full py-2 px-4 text-sm text-red-500 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                    <span>Gravando... {formatTime(recordingTime)}</span>
                  </div>
                  <button 
                    className="text-gray-500 p-1"
                    onClick={() => stopRecording()}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Botão home */}
        <div className="h-1 w-1/3 bg-gray-800 mx-auto mt-4 rounded-full"></div>
      </div>
    </div>
  );
}); 