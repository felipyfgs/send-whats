"use client"

import { useState, useEffect } from "react"
import { Contato, Tag } from "./columns"
import { useContatos } from "@/contexts/contatos-context"
import { toast } from "sonner"
import { TagSelector } from "./tag-selector"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

// Esquema de validação com zod
const contatoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().min(8, "Telefone deve ter pelo menos 8 caracteres"),
  categoria: z.enum(["pessoal", "trabalho", "familia", "outro"]),
  empresa: z.string().optional().or(z.literal("")),
  cargo: z.string().optional().or(z.literal("")),
  observacoes: z.string().optional().or(z.literal("")),
})

type ContatoFormValues = z.infer<typeof contatoSchema>

interface ContatoFormProps {
  contato?: Contato
  onSuccess?: () => void
  onCancel?: () => void
}

export function ContatoForm({ contato, onSuccess, onCancel }: ContatoFormProps) {
  const { createContato, updateContato, tags } = useContatos()
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const isEditing = !!contato

  // Configurar o formulário com react-hook-form
  const form = useForm<ContatoFormValues>({
    resolver: zodResolver(contatoSchema),
    defaultValues: {
      nome: contato?.nome || "",
      email: contato?.email || "",
      telefone: contato?.telefone || "",
      categoria: contato?.categoria || "pessoal",
      empresa: contato?.empresa || "",
      cargo: contato?.cargo || "",
      observacoes: contato?.observacoes || ""
    }
  })

  // Preencher tags selecionadas quando estiver editando
  useEffect(() => {
    if (contato?.tags) {
      setSelectedTagIds(contato.tags.map(tag => tag.id))
    }
  }, [contato])

  const onSubmit = async (data: ContatoFormValues) => {
    setIsSaving(true)
    
    try {
      // Buscar objetos Tag completos baseados nos IDs selecionados
      const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id))
      
      if (isEditing && contato) {
        // Atualizar contato existente
        await updateContato({
          ...contato,
          ...data,
          tags: selectedTags
        })
        toast.success("Contato atualizado com sucesso")
      } else {
        // Criar novo contato
        await createContato({
          ...data,
          tags: selectedTags
        } as Omit<Contato, "id">)
        toast.success("Contato criado com sucesso")
      }
      
      // Chamar função de sucesso se fornecida
      if (onSuccess) onSuccess()
      
      // Se não estiver editando, limpar o formulário
      if (!isEditing) {
        form.reset({
          nome: "",
          email: "",
          telefone: "",
          categoria: "pessoal",
          empresa: "",
          cargo: "",
          observacoes: ""
        })
        setSelectedTagIds([])
      }
    } catch (error) {
      console.error("Erro ao salvar contato:", error)
      toast.error(isEditing ? "Erro ao atualizar contato" : "Erro ao criar contato")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do contato" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(00) 00000-0000" {...field} />
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
                  <Input placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pessoal">Pessoal</SelectItem>
                    <SelectItem value="trabalho">Trabalho</SelectItem>
                    <SelectItem value="familia">Família</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="empresa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Empresa</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da empresa (opcional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cargo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <FormControl>
                  <Input placeholder="Cargo (opcional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observações adicionais sobre o contato (opcional)" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <FormLabel>Tags</FormLabel>
          <TagSelector
            tags={tags}
            selectedTagIds={selectedTagIds}
            onChange={setSelectedTagIds}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 