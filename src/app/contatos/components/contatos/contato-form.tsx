"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Contato, Tag, ContatoCategory } from "../types"
import { useContatos } from "@/contexts/contatos-context"
import { toast } from "sonner"
import { TagCompactList } from "../tags/tag-components"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, SubmitHandler } from "react-hook-form"
import * as z from "zod"
import { User, Phone, Mail, Building, Briefcase } from "lucide-react"
import { ContatoCategoriaIcon } from "../ContatoCategoriaIcon"

// Schema para validação de formulário
const contatoSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().min(8, "Telefone deve ter pelo menos 8 caracteres"),
  company: z.string().optional().or(z.literal("")),
  role: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  category: z.enum(["personal", "work", "family", "other"]),
})

// Tipo para os valores do formulário
type ContatoFormValues = z.infer<typeof contatoSchema>;

interface ContatoFormProps {
  contato?: Contato
  onSuccess?: () => void
  onCancel?: () => void
}

// Componente principal com memoização para evitar re-renderizações desnecessárias
export const ContatoForm = React.memo(function ContatoForm({ 
  contato, 
  onSuccess, 
  onCancel 
}: ContatoFormProps) {
  const { createContato, updateContato, tags } = useContatos()
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const isEditing = !!contato

  // Configura o formulário com valores padrão
  const form = useForm<ContatoFormValues>({
    resolver: zodResolver(contatoSchema),
    defaultValues: useMemo(() => ({
      name: contato?.name ?? "",
      email: contato?.email ?? "",
      phone: contato?.phone ?? "",
      company: contato?.company ?? "",
      role: contato?.role ?? "",
      notes: contato?.notes ?? "",
      category: contato?.category ?? "other",
    }), [contato]) // Dependência em contato para recalcular quando ele mudar
  })

  // Carrega as tags iniciais do contato quando for edição
  useEffect(() => {
    if (contato?.tags) {
      setSelectedTagIds(contato.tags.map(tag => tag.id))
    }
  }, [contato])

  // Função auxiliar para preparar valores para submissão
  const prepareValue = useCallback((value?: string | null) => {
    if (!value) return null
    const trimmed = value.trim()
    return trimmed === "" ? null : trimmed
  }, []);

  // Função para manipular a submissão do formulário 
  const onSubmit = useCallback<SubmitHandler<ContatoFormValues>>(async (data) => {
    setIsSaving(true)
    
    try {
      if (isEditing && contato?.id) {
        await updateContato({
          id: contato.id,
          name: data.name,
          phone: prepareValue(data.phone),
          email: prepareValue(data.email),
          category: data.category as ContatoCategory,
          tags: contato.tags || [],
          company: prepareValue(data.company),
          role: prepareValue(data.role),
          notes: prepareValue(data.notes)
        })
      } else {
        await createContato({
          name: data.name,
          phone: prepareValue(data.phone),
          email: prepareValue(data.email),
          category: data.category as ContatoCategory,
          tags: selectedTagIds.map(tagId => tags.find(tag => tag.id === tagId)!).filter(Boolean),
          company: prepareValue(data.company),
          role: prepareValue(data.role),
          notes: prepareValue(data.notes)
        })
      }

      if (onSuccess) onSuccess()
      
      if (!isEditing) {
        form.reset({
          name: "",
          email: "",
          phone: "",
          company: "",
          role: "",
          notes: "",
          category: "other",
        })
        setSelectedTagIds([])
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar o contato. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }, [isEditing, contato, prepareValue, updateContato, createContato, selectedTagIds, tags, onSuccess, form]);

  const handleCancel = useCallback(() => {
    if (onCancel) onCancel();
  }, [onCancel]);

  // Lista de categorias para o selector
  const categorias = useMemo(() => [
    { value: "personal", label: "Pessoal" },
    { value: "work", label: "Trabalho" },
    { value: "family", label: "Família" },
    { value: "other", label: "Outro" }
  ], []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações básicas */}
        <div className="space-y-2 mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Informações básicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Nome do contato" 
                        className="pl-9"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="(00) 00000-0000" 
                        className="pl-9"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Categoria e Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <div className="relative">
                    <ContatoCategoriaIcon 
                      categoria={field.value === 'personal' ? 'pessoal' : 
                        field.value === 'work' ? 'trabalho' : 
                        field.value === 'family' ? 'familia' : 'outro'} 
                      className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" 
                    />
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="pl-9">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map(categoria => (
                          <SelectItem key={categoria.value} value={categoria.value}>
                            <div className="flex items-center gap-2">
                              <ContatoCategoriaIcon 
                                categoria={
                                  categoria.value === 'personal' ? 'pessoal' : 
                                  categoria.value === 'work' ? 'trabalho' : 
                                  categoria.value === 'family' ? 'familia' : 'outro'
                                } 
                                className="h-4 w-4" 
                              />
                              <span>{categoria.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="email@exemplo.com" 
                      className="pl-9"
                      {...field} 
                      value={field.value || ""}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Informações profissionais */}
        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-medium text-muted-foreground">Informações profissionais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Nome da empresa" 
                        className="pl-9"
                        {...field} 
                        value={field.value || ""}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Briefcase className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Cargo na empresa" 
                        className="pl-9"
                        {...field} 
                        value={field.value || ""}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Notas */}
        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-medium text-muted-foreground">Informações adicionais</h3>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anotações</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Informações adicionais sobre o contato" 
                    {...field} 
                    value={field.value || ""}
                    className="min-h-[100px] resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Botões de ação */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                {isEditing ? "Atualizando..." : "Salvando..."}
              </>
            ) : (
              isEditing ? "Atualizar" : "Salvar"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
});
