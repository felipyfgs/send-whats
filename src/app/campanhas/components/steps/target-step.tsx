"use client";

import React, { useEffect, useState } from "react";
import { Campanha } from "@/contexts/campanhasContext";
import { useContatos } from "@/contexts/contatosContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { UsersIcon, Tags, Tag, User2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Schema para validação do formulário
const targetSchema = z.object({
  target: z.enum(["all", "tags", "contacts"]),
  tagIds: z.array(z.string()).optional(),
  contactIds: z.array(z.string()).optional(),
});

type TargetFormValues = z.infer<typeof targetSchema>;

interface TargetStepProps {
  formData: Partial<Campanha>;
  updateFormData: (data: Partial<Campanha>) => void;
}

export function TargetStep({ formData, updateFormData }: TargetStepProps) {
  const { contatos, tags } = useContatos();
  const [searchTag, setSearchTag] = useState("");
  const [searchContato, setSearchContato] = useState("");
  
  // Inicializar o formulário com o estado atual
  const form = useForm<TargetFormValues>({
    resolver: zodResolver(targetSchema),
    defaultValues: {
      target: formData.target === "custom" ? "all" : (formData.target || "all") as "all" | "tags" | "contacts",
      tagIds: formData.tagIds || [],
      contactIds: formData.contactIds || [],
    },
  });
  
  const targetValue = form.watch("target");
  
  // Filtrar contatos e tags com base na busca
  const filteredTags = tags.filter(tag => 
    tag.name?.toLowerCase().includes(searchTag.toLowerCase())
  );
  
  const filteredContatos = contatos.filter(contato => 
    contato.name?.toLowerCase().includes(searchContato.toLowerCase()) || 
    (contato.phone && contato.phone.includes(searchContato))
  );
  
  // Atualizar o formData quando os valores mudarem
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData({
        target: value.target,
        tagIds: (value.tagIds || []).filter(Boolean) as string[],
        contactIds: (value.contactIds || []).filter(Boolean) as string[],
      });
    });
    
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);
  
  // Função segura para obter tagIds
  const getTagIds = () => form.getValues().tagIds || [];
  
  // Função segura para obter contactIds
  const getContactIds = () => form.getValues().contactIds || [];
  
  return (
    <div className="space-y-6">
      <Form {...form}>
        <FormField
          control={form.control}
          name="target"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <div>
                <FormLabel className="text-base">Escolha o público-alvo</FormLabel>
              </div>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                  className="flex flex-col space-y-3"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="all" />
                    </FormControl>
                    <FormLabel className="font-normal flex items-center gap-2">
                      <UsersIcon className="h-4 w-4 text-primary" />
                      Todos os contatos
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="tags" />
                    </FormControl>
                    <FormLabel className="font-normal flex items-center gap-2">
                      <Tags className="h-4 w-4 text-primary" />
                      Contatos por tags
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="contacts" />
                    </FormControl>
                    <FormLabel className="font-normal flex items-center gap-2">
                      <User2 className="h-4 w-4 text-primary" />
                      Contatos específicos
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
      
      {/* Seletor de Tags */}
      {targetValue === "tags" && (
        <div className="mt-6">
          <div className="flex flex-col space-y-4">
            <Input
              placeholder="Buscar tags..."
              value={searchTag}
              onChange={(e) => setSearchTag(e.target.value)}
              className="mb-2"
            />
            
            <div className="rounded-md border p-4">
              {filteredTags.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma tag encontrada</p>
              ) : (
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-3">
                    {filteredTags.map(tag => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag.id}`}
                          checked={getTagIds().includes(tag.id)}
                          onCheckedChange={(checked) => {
                            const tagIds = getTagIds();
                            if (checked) {
                              form.setValue("tagIds", [...tagIds, tag.id]);
                            } else {
                              form.setValue("tagIds", tagIds.filter(id => id !== tag.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={`tag-${tag.id}`}
                          className="flex items-center justify-between w-full text-sm font-medium leading-none cursor-pointer"
                        >
                          <div className="flex items-center">
                            <div 
                              className="w-2 h-2 rounded-full mr-2" 
                              style={{ backgroundColor: tag.color }}
                            />
                            {tag.name}
                          </div>
                          <Badge variant="outline" className="ml-2 text-xs">Tag</Badge>
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
            
            {getTagIds().length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {getTagIds().map(tagId => {
                  const tag = tags.find(t => t.id === tagId);
                  return tag ? (
                    <Badge 
                      key={tag.id} 
                      style={{ backgroundColor: tag.color }} 
                      className="text-white"
                    >
                      {tag.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2"
                        onClick={() => {
                          const tagIds = getTagIds();
                          form.setValue("tagIds", tagIds.filter(id => id !== tag.id));
                        }}
                      >
                        <span className="sr-only">Remover</span>
                        <span aria-hidden="true">×</span>
                      </Button>
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Seletor de Contatos */}
      {targetValue === "contacts" && (
        <div className="mt-6">
          <div className="flex flex-col space-y-4">
            <Input
              placeholder="Buscar contatos..."
              value={searchContato}
              onChange={(e) => setSearchContato(e.target.value)}
              className="mb-2"
            />
            
            <div className="rounded-md border p-4">
              {filteredContatos.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Nenhum contato encontrado</p>
              ) : (
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-3">
                    {filteredContatos.map(contato => (
                      <div key={contato.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`contato-${contato.id}`}
                          checked={getContactIds().includes(contato.id)}
                          onCheckedChange={(checked) => {
                            const contactIds = getContactIds();
                            if (checked) {
                              form.setValue("contactIds", [...contactIds, contato.id]);
                            } else {
                              form.setValue("contactIds", contactIds.filter(id => id !== contato.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={`contato-${contato.id}`}
                          className="flex items-center w-full text-sm font-medium leading-none cursor-pointer"
                        >
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                              {contato.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {contato.name}
                          {contato.phone && (
                            <span className="text-xs text-muted-foreground ml-2">
                              {contato.phone}
                            </span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
            
            {getContactIds().length > 0 && (
              <div className="flex text-sm mt-2 items-center">
                <span className="text-muted-foreground">Selecionados: </span>
                <Badge variant="outline" className="ml-2">{getContactIds().length}</Badge>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 