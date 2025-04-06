"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCampanhas } from "@/contexts/campanhasContext";
import { DadosBasicosStep } from "./steps/dados-basicos-step";
import { TargetStep } from "./steps/target-step";
import { MensagemStep } from "./steps/mensagem-step";
import { RevisaoStep } from "./steps/revisao-step";
import { StatusCampanha } from "@/lib/supabase/campanhas";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { toast } from "sonner";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Componente para criar/editar campanhas
interface CriarCampanhaProps {
  onComplete?: () => void;
}

export function CriarCampanha({ onComplete }: CriarCampanhaProps) {
  const router = useRouter();
  const { addCampanha, updateCampanha } = useCampanhas();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    status: "rascunho" as StatusCampanha,
    startDate: null,
    target: "all",
    tagIds: [],
    contactIds: [],
    content: "",
    messages: []
  });

  // Lista de passos
  const steps = [
    {
      id: "dados-basicos",
      title: "Dados Básicos",
      component: DadosBasicosStep,
    },
    {
      id: "target",
      title: "Público-Alvo",
      component: TargetStep,
    },
    {
      id: "mensagem",
      title: "Mensagem",
      component: MensagemStep,
    },
    {
      id: "revisao",
      title: "Revisão",
      component: RevisaoStep,
    },
  ];

  // Verificar se um passo está completo
  const isStepComplete = useCallback((stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Dados Básicos
        return !!formData.title;
      case 1: // Público-Alvo
        return true; // Sempre válido pois tem opção "Todos os contatos"
      case 2: // Mensagem
        return !!formData.content || (formData.messages && formData.messages.length > 0);
      default:
        return true;
    }
  }, [formData]);

  // Calcular porcentagem de progresso
  const progressPercentage = useMemo(() => {
    let completedSteps = 0;
    for (let i = 0; i < steps.length; i++) {
      if (isStepComplete(i)) completedSteps++;
    }
    return (completedSteps / steps.length) * 100;
  }, [steps.length, isStepComplete]);

  // Atualizar dados do formulário
  const updateFormData = useCallback((data: Partial<typeof formData>) => {
    setFormData((prev: typeof formData) => ({ ...prev, ...data }));
  }, []);

  // Navegar para o próximo passo
  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      // Verificar se o passo atual está completo
      if (!isStepComplete(currentStep)) {
        switch (currentStep) {
          case 0:
            toast.error("Preencha o título da campanha");
            break;
          case 2:
            toast.error("Adicione pelo menos uma mensagem");
            break;
          default:
            toast.error("Preencha os campos obrigatórios");
        }
        return;
      }
      
      // Se estiver no passo de mensagem, garantir que as mensagens são salvas
      if (currentStep === 2) {
        // Mensagens serão salvas automaticamente pelo useEffect cleanup no MensagemStep
        toast.success("Mensagens salvas com sucesso!");
      }
      
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length, isStepComplete]);

  // Navegar para o passo anterior
  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Salvar campanha
  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      
      // Verificação de campos obrigatórios
      if (!formData.title) {
        toast.error("Preencha o título da campanha");
        setCurrentStep(0); // Voltar para o primeiro passo
        return;
      }
      
      if (!formData.content && (!formData.messages || formData.messages.length === 0)) {
        toast.error("Adicione pelo menos uma mensagem");
        setCurrentStep(2); // Voltar para o passo de mensagem
        return;
      }
      
      // Criar campanha no Supabase
      const campanha = await addCampanha(formData);
      
      toast.success("Campanha criada com sucesso!");
      
      // Usar onComplete se fornecido, caso contrário redirecionar
      if (onComplete) {
        onComplete();
      } else {
        router.push("/campanhas");
      }
    } catch (error) {
      console.error("Erro ao salvar campanha:", error);
      toast.error("Erro ao salvar campanha");
    } finally {
      setSaving(false);
    }
  }, [formData, addCampanha, router, onComplete]);

  // Cancelar e voltar
  const handleCancel = useCallback(() => {
    if (onComplete) {
      onComplete();
    } else {
      router.push("/campanhas");
    }
  }, [onComplete, router]);

  // Renderizar passo atual
  const StepComponent = steps[currentStep].component;

  // Ir para um passo específico (para breadcrumbs)
  const goToStep = (index: number) => {
    // Permitir apenas voltar para passos anteriores, não pular para frente
    if (index <= currentStep) {
      setCurrentStep(index);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs para navegação entre passos */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/campanhas">Campanhas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/campanhas/criar">Nova Campanha</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{steps[currentStep].title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      {/* Barra de progresso */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 max-w-xs">
          <Progress value={progressPercentage} className="h-2" />
        </div>
        <div className="text-sm text-muted-foreground ml-4">
          Passo {currentStep + 1} de {steps.length}
        </div>
      </div>
      
      {/* Lista de passos como minibreadcrumbs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <Button 
              variant={index === currentStep ? "default" : "ghost"} 
              size="sm"
              onClick={() => goToStep(index)}
              disabled={index > currentStep}
              className={`text-xs px-3 py-1 h-auto ${isStepComplete(index) && index < currentStep ? "text-green-600" : ""}`}
            >
              {step.title}
            </Button>
            {index < steps.length - 1 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Conteúdo do passo atual */}
      <div>
        <StepComponent formData={formData} updateFormData={updateFormData} />
      </div>
      
      {/* Botões de navegação */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? handleCancel : handlePrevious}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> 
          {currentStep === 0 ? "Cancelar" : "Anterior"}
        </Button>
        
        <div>
          {currentStep < steps.length - 1 ? (
            <Button 
              onClick={handleNext} 
              className="flex items-center gap-1"
              disabled={!isStepComplete(currentStep)}
            >
              Próximo <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSave} 
              disabled={saving || !isStepComplete(currentStep)}
              className="flex items-center gap-1"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Finalizar Campanha
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 