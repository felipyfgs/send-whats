"use client";

import { Campanha } from "@/contexts/campanhasContext";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Megaphone, CalendarRange, InfoIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePickerForm } from "@/components/custom/date-picker-form";
import { StatusCampanha } from "@/lib/supabase/campanhas";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Status em português para o select
const statusOptions = [
  { value: "rascunho", label: "Rascunho", color: "bg-slate-400" },
  { value: "agendada", label: "Agendada", color: "bg-yellow-500" },
  { value: "ativa", label: "Ativa", color: "bg-green-500" },
  { value: "pausada", label: "Pausada", color: "bg-amber-500" },
  { value: "concluida", label: "Concluída", color: "bg-blue-500" },
  { value: "cancelada", label: "Cancelada", color: "bg-red-500" },
];

// Schema para validação do formulário
const dadosBasicosSchema = z.object({
  title: z.string().min(3, "O título precisa ter no mínimo 3 caracteres"),
  description: z.string().nullable(),
  status: z.enum(["rascunho", "agendada", "ativa", "pausada", "concluida", "cancelada"]),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
});

type DadosBasicosFormValues = z.infer<typeof dadosBasicosSchema>;

interface DadosBasicosStepProps {
  formData: Partial<Campanha>;
  updateFormData: (data: Partial<Campanha>) => void;
}

export function DadosBasicosStep({ formData, updateFormData }: DadosBasicosStepProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    formData.startDate ? new Date(formData.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    formData.endDate ? new Date(formData.endDate) : undefined
  );
  
  const form = useForm<DadosBasicosFormValues>({
    resolver: zodResolver(dadosBasicosSchema),
    defaultValues: {
      title: formData.title || "",
      description: formData.description || "",
      status: (formData.status as StatusCampanha) || "rascunho",
      startDate: formData.startDate ? new Date(formData.startDate) : null,
      endDate: formData.endDate ? new Date(formData.endDate) : null,
    },
  });
  
  const watchTitle = form.watch("title");
  const watchStatus = form.watch("status");
  
  // Atualizar o formulário quando as datas mudarem
  useEffect(() => {
    if (startDate && form.getValues('startDate')?.getTime() !== startDate.getTime()) {
      form.setValue('startDate', startDate, { shouldDirty: true });
    }
  }, [startDate, form]);
  
  useEffect(() => {
    if (endDate && form.getValues('endDate')?.getTime() !== endDate.getTime()) {
      form.setValue('endDate', endDate, { shouldDirty: true });
    }
  }, [endDate, form]);
  
  // Atualizar o formData quando os valores mudarem
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData({
        title: value.title,
        description: value.description,
        status: value.status as StatusCampanha,
        startDate: value.startDate ? value.startDate.toISOString() : null,
        endDate: value.endDate ? value.endDate.toISOString() : null,
      });
    });
    
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Form {...form}>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      Título <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Megaphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Ex: Promoção de Verão" 
                          className="pl-10"
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva os objetivos da campanha..." 
                        className="resize-none min-h-[80px]"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center">
                                <div className={`h-2 w-2 rounded-full mr-2 ${option.color}`} />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <div className="mb-2">
                    <Label className="text-base">Período</Label>
                    <p className="text-sm text-muted-foreground">
                      Defina as datas de início e fim
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm">Início</Label>
                      <DateTimePickerForm
                        date={startDate}
                        setDate={(date) => {
                          setStartDate(date);
                          updateFormData({ ...formData, startDate: date ? date.toISOString() : null });
                        }}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm">Término</Label>
                      <DateTimePickerForm
                        date={endDate}
                        setDate={(date) => {
                          setEndDate(date);
                          updateFormData({ ...formData, endDate: date ? date.toISOString() : null });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Form>
        </div>
        
        <div className="space-y-6">
          <div>
            <p className="text-base font-medium mb-2">Prévia da Campanha</p>
            <p className="text-sm text-muted-foreground mb-4">
              Resumo com os dados preenchidos até o momento
            </p>
          </div>
          
          <Card className="bg-muted/40">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Título</p>
                  <p className="text-base font-medium">
                    {watchTitle || "Sem título"}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div>
                    {watchStatus && (
                      <Badge className={cn(
                        "text-white",
                        watchStatus === "rascunho" && "bg-slate-500",
                        watchStatus === "agendada" && "bg-yellow-500",
                        watchStatus === "ativa" && "bg-green-500",
                        watchStatus === "pausada" && "bg-amber-500",
                        watchStatus === "concluida" && "bg-blue-500",
                        watchStatus === "cancelada" && "bg-red-500",
                      )}>
                        {statusOptions.find(s => s.value === watchStatus)?.label || "Indefinido"}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Período</p>
                  <div className="flex items-center space-x-2">
                    <CalendarRange className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {startDate ? new Intl.DateTimeFormat('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      }).format(startDate) : "Não definido"}
                      {" "} - {" "}
                      {endDate ? new Intl.DateTimeFormat('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      }).format(endDate) : "Não definido"}
                    </p>
                  </div>
                </div>
              </div>
              
              {!watchTitle && (
                <div className="mt-6 flex items-start space-x-2 bg-amber-100 text-amber-700 p-2 rounded-md">
                  <InfoIcon className="h-4 w-4 mt-0.5" />
                  <p className="text-xs">Complete pelo menos o título da campanha para continuar.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 