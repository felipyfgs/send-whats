"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useContatos } from "@/contexts/contatos-context"
import { Tag } from "../types"
import { Button } from "@/components/ui/button"
import { Plus, TagIcon, Trash2, Edit, MoreHorizontal, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TagFormDialog } from "./tag-form-dialog"
import { toast } from "sonner"
import React from "react"
import { TagsSelector } from "@/components/custom/TagsSelector"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ColorPicker } from "./tag-components"

// Interfaces
interface TagsManagerProps {
  contatoIds?: string[]
  onClose?: () => void
  resetStateRef?: React.MutableRefObject<(() => void) | null>
}

// Utilitário para calcular cor de texto para contraste com fundo
function getTextColor(bgColor: string) {
  // Conversão hex para RGB
  const r = parseInt(bgColor.slice(1, 3), 16)
  const g = parseInt(bgColor.slice(3, 5), 16)
  const b = parseInt(bgColor.slice(5, 7), 16)
  
  // Fórmula de luminância relativa
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Retorna branco para cores escuras, e preto para cores claras
  return luminance > 0.65 ? "#000000" : "#FFFFFF"
}

// Componente principal para o gerenciamento de tags
function TagsManager({ contatoIds, onClose, resetStateRef }: TagsManagerProps) {
  // Context
  const { 
    tags, 
    contatos,
    selectedContatos,
    addTagsToContatos,
    removeTagsFromContatos,
    createTag,
    updateTag,
    deleteTag,
    refreshData
  } = useContatos()
  
  // Estados
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [showTagForm, setShowTagForm] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [tagsJaInicializadas, setTagsJaInicializadas] = useState(false)
  const [tagsOriginais, setTagsOriginais] = useState<string[]>([])
  
  // Fornecer uma função para resetar o estado
  useEffect(() => {
    const resetState = () => {
      console.log("Resetando estado do TagsManager");
      setTagsJaInicializadas(false);
      setSelectedTagIds([]);
      setTagsOriginais([]);
      setShowTagForm(false);
      setEditingTag(null);
    };
    
    // Expor a função de reset através da referência
    if (resetStateRef) {
      resetStateRef.current = resetState;
    }
    
    return () => {
      if (resetStateRef) {
        resetStateRef.current = null;
      }
    };
  }, [resetStateRef]);
  
  // Registrar renderização e mudanças de estado para depuração
  useEffect(() => {
    console.log("TagsManager renderizado, showTagForm:", showTagForm);
  }, [showTagForm]);
  
  // Gerenciamento de contatos
  const gerenciandoContatos = useMemo(() => {
    if (contatoIds && contatoIds.length > 0) {
      return contatoIds;
    }
    return selectedContatos;
  }, [contatoIds, selectedContatos]);
  
  // Calcula as tags selecionadas como objetos Tag a partir dos IDs
  const selectedTagsObjects = useMemo(() => {
    if (!Array.isArray(tags) || tags.length === 0 || selectedTagIds.length === 0) {
      return [];
    }
    return tags.filter(tag => selectedTagIds.includes(tag.id));
  }, [tags, selectedTagIds]);
  
  // Inicialização e carregamento de dados
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  
  // Resetar o estado quando o componente é montado ou quando os contatos mudam
  useEffect(() => {
    // Resetar a flag para que as tags sejam inicializadas novamente
    setTagsJaInicializadas(false);
    
    // Resetar as seleções quando os contatos sendo gerenciados mudam
    if (gerenciandoContatos.length > 0) {
      console.log("Resetando inicialização de tags para", gerenciandoContatos.length, "contato(s)");
    }
  }, [gerenciandoContatos]);
  
  // Carregar as tags já associadas aos contatos selecionados - APENAS UMA VEZ
  useEffect(() => {
    // Não executar se as tags já foram inicializadas ou se não houver dados suficientes
    if (tagsJaInicializadas || !contatos || !Array.isArray(contatos) || gerenciandoContatos.length === 0) {
      return;
    }
    
    console.log("Inicializando tags para contato(s):", gerenciandoContatos);
    
    // Busca os contatos sendo gerenciados
    const contatosSelecionados = contatos.filter(contato => 
      gerenciandoContatos.includes(contato.id)
    );
    
    console.log("Contatos selecionados encontrados:", contatosSelecionados.length);
    
    if (contatosSelecionados.length === 0) {
      setTagsJaInicializadas(true);
      return;
    }
    
    if (contatosSelecionados.length === 1) {
      // Se for apenas um contato, selecionar todas as tags dele
      const tagsDoContato = contatosSelecionados[0].tags?.map(tag => tag.id) || [];
      console.log("Tags do contato único:", tagsDoContato);
      setSelectedTagIds(tagsDoContato);
      setTagsOriginais(tagsDoContato);
    } else {
      // Se forem múltiplos contatos, encontrar as tags comuns a todos
      const tagsMap: Record<string, number> = {};
      
      // Conta quantos contatos têm cada tag
      contatosSelecionados.forEach(contato => {
        if (contato.tags && Array.isArray(contato.tags)) {
          contato.tags.forEach(tag => {
            tagsMap[tag.id] = (tagsMap[tag.id] || 0) + 1;
          });
        }
      });
      
      console.log("Mapa de contagem de tags:", tagsMap);
      
      // Seleciona apenas as tags que estão presentes em todos os contatos
      const tagsComuns = Object.entries(tagsMap)
        .filter(([_, count]) => count === contatosSelecionados.length)
        .map(([tagId]) => tagId);
      
      console.log("Tags comuns a todos os contatos:", tagsComuns);
      setSelectedTagIds(tagsComuns);
      setTagsOriginais(tagsComuns);
    }
    
    // Marcar que as tags já foram inicializadas para não executar novamente
    setTagsJaInicializadas(true);
  }, [contatos, gerenciandoContatos, tagsJaInicializadas]);
  
  // Função para aplicar todas as alterações de tags
  const aplicarAlteracoesDeTag = useCallback(async () => {
    if (gerenciandoContatos.length === 0) return;
    
    try {
      console.log("Aplicando alterações de tags:", {
        selecionadas: selectedTagIds,
        originais: tagsOriginais,
        contatos: gerenciandoContatos
      });
      
      const tagsAdicionadas = selectedTagIds.filter(id => !tagsOriginais.includes(id));
      const tagsRemovidas = tagsOriginais.filter(id => !selectedTagIds.includes(id));
      
      let contatosAtualizados = false;
      
      if (tagsAdicionadas.length > 0) {
        console.log("Adicionando tags:", tagsAdicionadas);
        await addTagsToContatos(gerenciandoContatos, tagsAdicionadas);
        contatosAtualizados = true;
      }
      
      if (tagsRemovidas.length > 0) {
        console.log("Removendo tags:", tagsRemovidas);
        await removeTagsFromContatos(gerenciandoContatos, tagsRemovidas);
        contatosAtualizados = true;
      }
      
      if (contatosAtualizados) {
        // Atualizar os dados após aplicar as alterações
        await refreshData();
        
        // Atualizar as tags originais para refletir o estado atual
        setTagsOriginais([...selectedTagIds]);
        
        toast.success(`Tags atualizadas em ${gerenciandoContatos.length} contato(s)`);
        
        // Se houver função de fechamento, pode chamar aqui se desejado
        // if (onClose) onClose();
      } else {
        toast.info("Nenhuma alteração de tag para aplicar");
      }
    } catch (error) {
      console.error("Erro ao aplicar alterações de tags:", error);
      toast.error("Não foi possível aplicar as alterações de tags");
    }
  }, [gerenciandoContatos, selectedTagIds, tagsOriginais, addTagsToContatos, removeTagsFromContatos, refreshData]);
  
  // Handler para criar uma nova tag
  const handleCreateTag = useCallback(async (tagData: { name: string, color: string }) => {
    try {
      if (!tagData.name.trim()) {
        toast.error("O nome da tag não pode estar vazio");
        return;
      }
      
      console.log("Criando tag:", tagData); // Log para depuração
      
      // Chamar a função do contexto para criar a tag
      await createTag({
        name: tagData.name.trim(),
        color: tagData.color
      });
      
      // Fechar o formulário
      setShowTagForm(false);
      setEditingTag(null);
      
      // Atualizar a lista de tags
      await refreshData();
      
      // Mostrar mensagem de sucesso
      toast.success("Tag criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar tag:", error);
      toast.error("Não foi possível criar a tag. Tente novamente.");
    }
  }, [createTag, refreshData]);
  
  // Handler para editar uma tag existente
  const handleUpdateTag = useCallback(async (tagData: { name: string, color: string }) => {
    try {
      if (!editingTag) {
        toast.error("Nenhuma tag selecionada para edição");
        return;
      }
      
      if (!tagData.name.trim()) {
        toast.error("O nome da tag não pode estar vazio");
        return;
      }
      
      console.log("Atualizando tag:", tagData); // Log para depuração
      
      // Chamar a função do contexto para atualizar a tag
      await updateTag({
        ...editingTag,
        name: tagData.name.trim(),
        color: tagData.color
      });
      
      // Fechar o formulário e limpar estado
      setShowTagForm(false);
      setEditingTag(null);
      
      // Atualizar a lista de tags
      await refreshData();
      
      // Mostrar mensagem de sucesso
      toast.success("Tag atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar tag:", error);
      toast.error("Não foi possível atualizar a tag. Tente novamente.");
    }
  }, [editingTag, updateTag, refreshData]);
  
  // Handler unificado para salvar tag (criar ou atualizar)
  const handleSaveTag = useCallback(async (tagData: { name: string, color: string }) => {
    if (editingTag) {
      await handleUpdateTag(tagData);
    } else {
      await handleCreateTag(tagData);
    }
  }, [editingTag, handleCreateTag, handleUpdateTag]);
  
  // Handlers
  const handleEditTag = useCallback((tag: Tag) => {
    setEditingTag(tag);
    setShowTagForm(true);
    console.log("Editando tag, showTagForm definido para:", true);
  }, []);
  
  // Handler para botão Nova Tag
  const handleNovaTag = useCallback(() => {
    console.log("Botão Nova Tag clicado, estado atual showTagForm:", showTagForm);
    setEditingTag(null);
    setShowTagForm(true);
    console.log("Após clicar Nova Tag, showTagForm definido para:", true);
  }, [showTagForm]);
  
  // Handler para excluir uma tag específica
  const handleDeleteTag = useCallback(async (tagId: string) => {
    try {
      await deleteTag(tagId, false);
      toast.success("Tag excluída com sucesso");
      
      // Remove a tag da seleção se estiver selecionada
      setSelectedTagIds(prev => prev.filter(id => id !== tagId));
    } catch (error) {
      // Erro silencioso - apenas mostra toast
      toast.error("Erro ao excluir a tag");
    }
  }, [deleteTag]);
  
  const handleDeleteSelectedTags = useCallback(async () => {
    if (selectedTagIds.length === 0) return;
    
    try {
      const promises = selectedTagIds.map(id => deleteTag(id, true));
      await Promise.all(promises);
      setSelectedTagIds([]);
      toast.success(`${selectedTagIds.length} tag(s) excluída(s) com sucesso`);
    } catch (error) {
      toast.error("Erro ao excluir as tags selecionadas");
    }
  }, [selectedTagIds, deleteTag]);
  
  // Substituir o TagFormInline por uma chamada para TagFormDialog
  const renderTagFormDialog = () => {
    if (!showTagForm) return null;
    
    return (
      <TagFormDialog
        tag={editingTag}
        onSave={handleSaveTag}
        defaultOpen={true}
        onOpenChange={(open) => {
          if (!open) setShowTagForm(false);
        }}
      />
    );
  };
  
  // Renderiza um chip para cada tag disponível
  const renderTagChips = useCallback(() => {
    if (!tags || !Array.isArray(tags) || tags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {tags.map(tag => {
          const isSelected = selectedTagIds.includes(tag.id);
          
          return (
            <div
              key={tag.id}
              className={`
                relative group flex items-center gap-1 px-3 py-1.5 rounded-full
                cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'ring-2 ring-offset-2 ring-primary/30' 
                  : 'hover:ring-1 hover:ring-offset-1 hover:ring-muted-foreground/30'
                }
              `}
              style={{ 
                backgroundColor: tag.color,
                color: getTextColor(tag.color),
              }}
              onClick={() => {
                setSelectedTagIds(prev => 
                  isSelected
                    ? prev.filter(id => id !== tag.id)
                    : [...prev, tag.id]
                );
              }}
            >
              <span className="text-sm font-medium">{tag.name}</span>
              
              {/* Contador de usos da tag */}
              {contatos && (
                <span className="text-xs opacity-80 ml-1">
                  {contatos.filter(c => 
                    c.tags && c.tags.some(t => t.id === tag.id)
                  ).length}
                </span>
              )}
              
              {/* Botões de ação sobrepostos (edit/delete) */}
              <div className="absolute right-0 top-0 bottom-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 mr-0.5 bg-muted/20 hover:bg-muted/40 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTag(tag);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Editar tag</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 bg-muted/20 hover:bg-destructive/40 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTag(tag.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Excluir tag</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {/* Indicador visual de seleção */}
              {isSelected && (
                <Check className="h-3.5 w-3.5 ml-0.5" />
              )}
            </div>
          );
        })}
      </div>
    );
  }, [tags, contatos, selectedTagIds, handleEditTag, handleDeleteTag]);

  return (
    <div className="space-y-4">
      {/* Cabeçalho com informações */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">
          Gerenciar Tags
        </h3>
        <p className="text-sm text-muted-foreground">
          {gerenciandoContatos.length === 1
            ? "Selecione as tags para este contato"
            : `Gerenciando tags para ${gerenciandoContatos.length} contatos`}
        </p>
      </div>
      
      {/* Barra de ações */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleNovaTag}
          className="h-8"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Nova Tag
        </Button>
        
        <Button
          size="sm"
          variant="secondary"
          onClick={aplicarAlteracoesDeTag}
          className="h-8"
        >
          <Check className="h-3.5 w-3.5 mr-1.5" />
          Aplicar Mudanças
        </Button>
      </div>
      
      {/* Lista de tags disponíveis */}
      <div className="bg-muted/20 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">Tags Disponíveis</h4>
          <span className="text-xs text-muted-foreground">
            {tags?.length || 0} tags • {selectedTagIds.length} selecionadas
          </span>
        </div>
        {renderTagChips()}
        {(!tags || tags.length === 0) && (
          <p className="text-sm text-muted-foreground mt-2">
            Não há tags disponíveis. Crie uma nova tag com o botão acima.
          </p>
        )}
      </div>
      
      {/* Tags selecionadas */}
      {selectedTagIds.length > 0 && (
        <div className="bg-primary/5 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Tags Selecionadas</h4>
            <span className="text-xs text-muted-foreground">
              {selectedTagIds.length} tags
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTagsObjects.map(tag => (
              <Badge 
                key={tag.id}
                style={{ 
                  backgroundColor: tag.color,
                  color: getTextColor(tag.color)
                }}
                className="px-3 py-1 cursor-pointer"
                onClick={() => {
                  setSelectedTagIds(prev => prev.filter(id => id !== tag.id));
                }}
              >
                {tag.name}
                <Trash2 className="h-3 w-3 ml-1.5 opacity-70" />
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Dialog de criação/edição de tag */}
      {renderTagFormDialog()}
    </div>
  );
}

// Componente TagsButton - botão para abrir o gerenciador de tags
interface TagsButtonProps {
  contatoIds?: string[]
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
}

// Controlador global para o diálogo
let globalTagsDialogController: {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  contatoIds?: string[];
} = {
  isOpen: false,
  setOpen: () => {},
};

// TagsDialog - Componente separado para o diálogo
function TagsDialogComponent() {
  const { refreshData } = useContatos();
  const [open, setOpen] = useState(false);
  const [contatoIds, setContatoIds] = useState<string[] | undefined>(undefined);
  // Criar uma referência para a função de resetar estado
  const resetTagsStateRef = useRef<(() => void) | null>(null);
  
  // Atualiza o controlador global
  useEffect(() => {
    globalTagsDialogController = {
      isOpen: open,
      setOpen: (newOpen: boolean) => {
        if (newOpen && !open) {
          // Recarregar dados quando abrir o diálogo
          console.log("Abrindo diálogo de tags, recarregando dados");
          refreshData().catch(err => {
            toast.error("Erro ao carregar dados");
          });
        }
        setOpen(newOpen);
      },
      contatoIds,
    };
    
    // Definir a função openTagsDialog apenas no cliente
    if (typeof window !== 'undefined') {
      window.openTagsDialog = (ids?: string[]) => {
        console.log("openTagsDialog chamado com ids:", ids);
        setContatoIds(ids);
        setOpen(true);
        return { success: true };
      };
    }
    
    return () => {
      // Limpa o controlador ao desmontar
      if (globalTagsDialogController.setOpen === setOpen) {
        globalTagsDialogController = {
          isOpen: false,
          setOpen: () => {},
        };
      }
      
      // Limpar a função global ao desmontar
      if (typeof window !== 'undefined' && window.openTagsDialog) {
        window.openTagsDialog = undefined;
      }
    };
  }, [open, contatoIds, refreshData]);
  
  // Renderiza o diálogo apenas se estiver aberto
  if (!open) return null;
  
  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen && resetTagsStateRef.current) {
          // Limpar estado ao fechar
          resetTagsStateRef.current();
        }
      }}
    >
      <DialogContent 
        className="sm:max-w-[600px] max-h-[90vh] overflow-auto"
        onInteractOutside={(e) => e.preventDefault()} // Impedir fechamento ao clicar fora
      >
        <DialogHeader>
          <DialogTitle>Gerenciador de Tags</DialogTitle>
          <DialogDescription>
            Gerencie as tags do sistema. Selecione, crie, edite ou remova tags conforme necessário.
          </DialogDescription>
        </DialogHeader>
        
        <TagsManager 
          contatoIds={contatoIds} 
          onClose={() => setOpen(false)}
          resetStateRef={resetTagsStateRef} 
        />
      </DialogContent>
    </Dialog>
  );
}

// Exportação nomeada para dynamic import
export const TagsDialog = TagsDialogComponent;

// Componente principal com memo para evitar re-renderizações
export const TagsButton = React.memo(function TagsButton({
  contatoIds,
  variant = "outline",
  size = "sm",
  className,
  children
}: TagsButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Manipulador de clique com debounce para evitar cliques múltiplos
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Tentativa de abrir via controlador global
      if (typeof window !== 'undefined' && window.openTagsDialog) {
        window.openTagsDialog(contatoIds);
      } else {
        // Fallback direto
        globalTagsDialogController.contatoIds = contatoIds;
        globalTagsDialogController.setOpen(true);
      }
    } catch (err) {
      toast.error("Erro ao abrir diálogo");
    }
    
    // Reset do estado após delay para evitar múltiplos cliques
    setTimeout(() => {
      setIsProcessing(false);
    }, 300);
  }, [contatoIds, isProcessing]);
  
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={isProcessing}
    >
      {children || (
        <>
          <TagIcon className="h-4 w-4 mr-2" />
          Gerenciar Tags
        </>
      )}
    </Button>
  );
});

// Declarar tipo global da função openTagsDialog
declare global {
  interface Window {
    openTagsDialog?: (contatoIds?: string[]) => { success: boolean };
  }
}
