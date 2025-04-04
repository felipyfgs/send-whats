"use client"

import React, { useState, useEffect } from "react"
import { Tag } from "../types"
import { useContatos } from "@/contexts/contatos-context"
import { toast } from "sonner"
import { TagSelector } from "../tags/tag-selector"

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

interface ContatoBase {
  id?: string
  name: string
  phone: string | null
  email: string | null
  company: string | null
  role: string | null
  notes: string | null
  category: "personal" | "work" | "family" | "other"
}

const contatoSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().min(8, "Telefone deve ter pelo menos 8 caracteres"),
  company: z.string().optional().or(z.literal("")),
  role: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  category: z.enum(["personal", "work", "family", "other"]),
})

interface ContatoFormProps {
  contato?: ContatoBase & { tags?: Tag[] }
  onSuccess?: () => void
  onCancel?: () => void
}

export function ContatoForm({ contato, onSuccess, onCancel }: ContatoFormProps) {
  const { createContato, updateContato, tags } = useContatos()
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const isEditing = !!contato

  const form = useForm<z.infer<typeof contatoSchema>>({
    resolver: zodResolver(contatoSchema),
    defaultValues: {
      name: contato?.name ?? "",
      email: contato?.email ?? "",
      phone: contato?.phone ?? "",
      company: contato?.company ?? "",
      role: contato?.role ?? "",
      notes: contato?.notes ?? "",
      category: contato?.category ?? "other",
    }
  })

  useEffect(() => {
    if (contato?.tags) {
      setSelectedTagIds(contato.tags.map(tag => tag.id))
    }
  }, [contato])

  const onSubmit: SubmitHandler<z.infer<typeof contatoSchema>> = async (data) => {
    setIsSaving(true)
    
    try {
      const prepareValue = (value?: string | null) => {
        if (!value) return null
        const trimmed = value.trim()
        return trimmed === "" ? null : trimmed
      }

      if (isEditing && contato?.id) {
        await updateContato({
          id: contato.id,
          name: data.name,
          phone: prepareValue(data.phone),
          email: prepareValue(data.email),
          category: data.category,
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
          category: data.category,
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nome do contato" 
                    {...field} 
                  />
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
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(00) 00000-0000" 
                    {...field} 
                  />
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
                  <Input 
                    placeholder="email@exemplo.com" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Empresa</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nome da empresa (opcional)" 
                    {...field} 
                  />
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
                  <Input 
                    placeholder="Cargo (opcional)" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="personal">Pessoal</SelectItem>
                    <SelectItem value="work">Trabalho</SelectItem>
                    <SelectItem value="family">Família</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
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
        
        <div className="mt-4">
          <FormLabel>Tags</FormLabel>
          <div className="flex flex-wrap items-center gap-2">
            <TagSelector
              tags={tags}
              selectedTagIds={selectedTagIds}
              onChange={setSelectedTagIds}
              variant="simple"
            />
          </div>
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
