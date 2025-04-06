"use client"

import { useCallback, useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Megaphone, Users, Tag as TagIcon, Check, ChevronsUpDown, X } from "lucide-react"
import { useCampanhas } from "@/contexts/campanhasContext"
import { useContatos } from "@/contexts/contatosContext"
import { toast } from "sonner"
import { StatusCampanha } from "@/lib/supabase/campanhas"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/custom/radio-group"
import { Badge } from "@/components/ui/badge"
import { Campanha } from "@/contexts/campanhasContext"
import { 
  DateTimePickerForm 
} from "@/components/custom/date-picker-form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { MultiSelect, OptionType } from "@/components/custom/multi-select"

// Schema para validação do formulário
const campanhaFormSchema = z.object({
  title: z.string().min(3, "O título precisa ter no mínimo 3 caracteres"),
  description: z.string().nullable(),
  status: z.enum(["rascunho", "agendada", "ativa", "pausada", "concluida", "cancelada"]),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  target: z.enum(["all", "tags", "contacts", "custom"]),
  contactIds: z.array(z.string()),
  tagIds: z.array(z.string()),
  content: z.string().min(3, "O conteúdo da campanha é obrigatório"),
});

type CampanhaFormValues = z.infer<typeof campanhaFormSchema>;

// Status em português para o select
const statusOptions = [
  { value: "rascunho", label: "Rascunho" },
  { value: "agendada", label: "Agendada" },
  { value: "ativa", label: "Ativa" },
  { value: "pausada", label: "Pausada" },
  { value: "concluida", label: "Concluída" },
  { value: "cancelada", label: "Cancelada" },
];

// Opções de público-alvo
const targetOptions = [
  { value: "all", label: "Todos os contatos" },
  { value: "tags", label: "Baseado em tags" },
  { value: "contacts", label: "Contatos específicos" },
  { value: "custom", label: "Personalizado" },
];

interface CampanhaFormProps {
  campanha?: Campanha;
  readOnly?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Definir o tipo correto para o formData com as conversões necessárias
interface CampanhaFormData {
  title: string;
  description: string | null;
  status: StatusCampanha;
  startDate: string | null;
  endDate: string | null;
  target: "all" | "tags" | "contacts" | "custom";
  tagIds: string[];
  contactIds: string[];
  content?: string;
}

export function CampanhaForm({ 
  campanha, 
  readOnly = false,
  onSuccess, 
  onCancel 
}: CampanhaFormProps) {
  const { addCampanha, updateCampanha, grupos } = useCampanhas();
  const { tags, contatos } = useContatos();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(campanha?.tagIds || []);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>(campanha?.contactIds || []);
  const [startDate, setStartDate] = useState<Date | undefined>(
    campanha?.startDate ? new Date(campanha.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    campanha?.endDate ? new Date(campanha.endDate) : undefined
  );
  
  const form = useForm<CampanhaFormValues>({
    resolver: zodResolver(campanhaFormSchema),
    defaultValues: {
      title: campanha?.title || "",
      description: campanha?.description || "",
      status: (campanha?.status as StatusCampanha) || "rascunho",
      startDate: campanha?.startDate ? new Date(campanha.startDate) : null,
      endDate: campanha?.endDate ? new Date(campanha.endDate) : null,
      target: campanha?.target || "all",
      contactIds: campanha?.contactIds || [],
      tagIds: campanha?.tagIds || [],
      content: campanha?.content || "",
    },
  });

  // Atualizar IDs de tags e contatos quando o formulário mudar
  useEffect(() => {
    if (campanha) {
      setSelectedTagIds(campanha.tagIds || []);
      setSelectedContactIds(campanha.contactIds || []);
      setStartDate(campanha.startDate ? new Date(campanha.startDate) : undefined);
      setEndDate(campanha.endDate ? new Date(campanha.endDate) : undefined);
    }
  }, [campanha]);

  // Atualizar valores do formulário quando as datas mudarem
  useEffect(() => {
    form.setValue('startDate', startDate || null);
  }, [startDate, form]);

  useEffect(() => {
    form.setValue('endDate', endDate || null);
  }, [endDate, form]);

  // Atualizar valores do formulário quando os IDs mudarem
  useEffect(() => {
    form.setValue('tagIds', selectedTagIds);
  }, [selectedTagIds, form]);

  useEffect(() => {
    form.setValue('contactIds', selectedContactIds);
  }, [selectedContactIds, form]);

  // Manipulador de submissão do formulário
  const onSubmit = useCallback(async (data: CampanhaFormValues) => {
    if (readOnly) return;
    
    try {
      setIsSaving(true);
      
      // Validar dados antes de enviar
      if (data.target === 'tags' && selectedTagIds.length === 0) {
        toast.error("Selecione pelo menos uma tag quando o público-alvo for baseado em tags");
        return;
      }
      
      if (data.target === 'contacts' && selectedContactIds.length === 0) {
        toast.error("Selecione pelo menos um contato quando o público-alvo for baseado em contatos");
        return;
      }
      
      // Criar objeto com os tipos corretos
      const formData: CampanhaFormData = {
        ...data,
        tagIds: selectedTagIds,
        contactIds: selectedContactIds,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
      };
      
      if (campanha) {
        await updateCampanha(campanha.id, formData);
        toast.success("Campanha atualizada com sucesso!");
      } else {
        await addCampanha(formData);
        toast.success("Campanha criada com sucesso!");
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao salvar campanha:", error);
      toast.error("Ocorreu um erro ao salvar a campanha");
    } finally {
      setIsSaving(false);
    }
  }, [addCampanha, updateCampanha, campanha, selectedTagIds, selectedContactIds, startDate, endDate, onSuccess, readOnly]);

  // Adicionar ou remover tag
  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Adicionar ou remover contato
  const toggleContact = (contactId: string) => {
    setSelectedContactIds(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  // Remover tag da seleção
  const removeTag = (tagId: string) => {
    setSelectedTagIds(prev => prev.filter(id => id !== tagId));
  };

  // Remover contato da seleção
  const removeContact = (contactId: string) => {
    setSelectedContactIds(prev => prev.filter(id => id !== contactId));
  };

  // Renderiza tags selecionadas
  const renderSelectedTags = () => {
    const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id));
    
    if (selectedTags.length === 0) {
      return <p className="text-sm text-muted-foreground">Nenhuma tag selecionada</p>;
    }
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {selectedTags.map(tag => (
          <Badge 
            key={tag.id} 
            style={{ backgroundColor: tag.color }} 
            className="text-white group"
          >
            {tag.name}
            {!readOnly && (
              <button 
                type="button"
                onClick={() => removeTag(tag.id)} 
                className="ml-1 opacity-70 hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>
    );
  };

  // Renderiza contatos selecionados
  const renderSelectedContacts = () => {
    const selectedContatos = contatos.filter(contato => 
      selectedContactIds.includes(contato.id)
    );
    
    if (selectedContatos.length === 0) {
      return <p className="text-sm text-muted-foreground">Nenhum contato selecionado</p>;
    }
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {selectedContatos.map(contato => (
          <Badge key={contato.id} variant="outline" className="group">
            {contato.name}
            {!readOnly && (
              <button 
                type="button"
                onClick={() => removeContact(contato.id)} 
                className="ml-1 opacity-70 hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>
    );
  };

  // Renderiza informações dos grupos selecionados (Supabase)
  const renderGrupos = () => {
    if (grupos.length === 0) {
      return <p className="text-sm text-muted-foreground">Nenhum grupo disponível</p>;
    }
    
    return (
      <div className="mt-2">
        <h4 className="text-sm font-medium mb-2">Grupos que receberão a campanha:</h4>
        <div className="flex flex-wrap gap-1">
          {grupos.map(grupo => (
            <Badge key={grupo.id} variant="outline" className="bg-muted/30">
              {grupo.nome}
              <span className="text-xs ml-1 text-muted-foreground">
                ({grupo.descricao ? grupo.descricao : "Sem descrição"})
              </span>
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações básicas */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <div className="relative">
                    <Megaphone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Nome da campanha" 
                      className="pl-9"
                      {...field} 
                      disabled={readOnly}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descrição da campanha" 
                    className="resize-none min-h-[80px]"
                    {...field}
                    value={field.value || ""} 
                    disabled={readOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    disabled={readOnly}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Público-alvo</FormLabel>
                  <Select
                    disabled={readOnly}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um alvo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {targetOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de início</FormLabel>
                  <FormControl>
                    <DateTimePickerForm
                      date={startDate}
                      setDate={setStartDate}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de término</FormLabel>
                  <FormControl>
                    <DateTimePickerForm
                      date={endDate}
                      setDate={setEndDate}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Seleção de tags */}
        <div className="space-y-4">
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <TagIcon className="h-4 w-4" />
              Tags
            </FormLabel>
            <MultiSelect
              options={tags.map(tag => ({
                value: tag.id,
                label: tag.name,
                color: tag.color
              }))}
              selected={selectedTagIds}
              onChange={setSelectedTagIds}
              placeholder="Selecionar tags"
              searchPlaceholder="Buscar tags..."
              emptyText="Nenhuma tag encontrada."
              disabled={readOnly}
              renderOption={(option, isSelected) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    const newSelected = isSelected
                      ? selectedTagIds.filter(id => id !== option.value)
                      : [...selectedTagIds, option.value];
                    setSelectedTagIds(newSelected);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isSelected ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div
                    className="h-3 w-3 rounded-full mr-2"
                    style={{ backgroundColor: option.color }}
                  />
                  {option.label}
                </CommandItem>
              )}
              renderBadge={(option) => {
                const tag = tags.find(tag => tag.id === option.value);
                return (
                  <Badge 
                    key={option.value} 
                    style={{ backgroundColor: tag?.color }} 
                    className="text-white group"
                  >
                    {option.label}
                    {!readOnly && (
                      <button 
                        type="button"
                        onClick={() => removeTag(option.value)} 
                        className="ml-1 opacity-70 hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                );
              }}
            />
          </FormItem>
          
          {/* Seleção de contatos */}
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Contatos
            </FormLabel>
            <MultiSelect
              options={contatos.map(contato => ({
                value: contato.id,
                label: contato.name,
                phone: contato.phone
              }))}
              selected={selectedContactIds}
              onChange={setSelectedContactIds}
              placeholder="Selecionar contatos"
              searchPlaceholder="Buscar contatos..."
              emptyText="Nenhum contato encontrado."
              disabled={readOnly}
              renderOption={(option, isSelected) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    const newSelected = isSelected
                      ? selectedContactIds.filter(id => id !== option.value)
                      : [...selectedContactIds, option.value];
                    setSelectedContactIds(newSelected);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isSelected ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                  {option.phone && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {option.phone}
                    </span>
                  )}
                </CommandItem>
              )}
            />
          </FormItem>
          
          {/* Grupos disponíveis */}
          {renderGrupos()}
        </div>
        
        {/* Conteúdo da mensagem */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conteúdo da mensagem <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Digite aqui o conteúdo da mensagem que será enviada..."
                  className="resize-none min-h-[120px]"
                  {...field}
                  disabled={readOnly}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botões de ação */}
        {!readOnly && (
          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : campanha ? "Atualizar" : "Criar"} campanha
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
} 