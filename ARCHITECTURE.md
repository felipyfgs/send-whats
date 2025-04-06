# Arquitetura do Projeto

## Visão Geral

Este documento descreve a arquitetura e organização do código do projeto, servindo como um registro histórico das decisões de design e padrões utilizados.

## Estrutura de Pastas

```
src/
├── app/                            # Next.js App Router
│   ├── contatos/                   # Módulo de contatos
│   │   ├── components/             # Componentes específicos da página
│   │   │   ├── contatos/           # Componentes relacionados à gestão de contatos
│   │   │   │   ├── contato-dialog.tsx         # Diálogo unificado de criar/editar
│   │   │   │   ├── contato-detail-dialog.tsx  # Detalhes de contato
│   │   │   │   ├── contato-form.tsx           # Formulário de contato
│   │   │   │   ├── contato-tags-button.tsx    # Botão de gestão de tags
│   │   │   │   ├── contatos-actions.tsx       # Ações da tabela de contatos
│   │   │   │   ├── contatos-table.tsx         # Tabela principal de contatos
│   │   │   │   ├── columns.tsx                # Definição de colunas da tabela
│   │   │   │   ├── data-table.tsx             # Implementação de tabela genérica
│   │   │   │   └── multi-select.tsx           # Componente de seleção múltipla
│   │   │   ├── tags/                # Componentes relacionados a tags
│   │   │   │   ├── tags.tsx                   # Gerenciador principal de tags
│   │   │   │   ├── tag-form-dialog.tsx        # Formulário de criar/editar tag
│   │   │   │   ├── tag-components.tsx         # Componentes auxiliares de tags
│   │   │   │   ├── tag-compact-list.tsx       # Lista compacta de tags
│   │   │   │   └── color-picker.tsx           # Seletor de cores
│   │   │   ├── client-components.tsx # Componentes específicos para client-side
│   │   │   └── types.ts              # Tipos e interfaces
│   │   ├── utils/                  # Utilitários do módulo
│   │   │   ├── contato-helpers.ts   # Funções auxiliares para contatos
│   │   │   └── index.ts             # Arquivo barrel para utilitários
│   │   ├── README.md               # Documentação do módulo
│   │   └── page.tsx                # Página principal de contatos
│   ├── layout.tsx                  # Layout principal do app
│   └── page.tsx                    # Página inicial
├── components/                     # Componentes globais reutilizáveis
│   ├── ui/                         # Componentes base da UI (shadcn)
│   │   ├── button.tsx              # Componente de botão
│   │   ├── dialog.tsx              # Componente de diálogo
│   │   └── ...                     # Outros componentes UI
│   └── custom/                     # Componentes customizados gerais
│       └── TagsSelector.tsx        # Seletor de tags global
├── contexts/                       # Contextos React
│   └── contatos-context.tsx        # Contexto para gerenciamento de contatos
├── hooks/                          # Hooks globais customizados
│   └── use-toast.ts                # Hook para notificações
├── lib/                            # Bibliotecas e utilitários
│   ├── supabase/                   # Cliente e utilitários Supabase
│   │   └── database.ts             # Funções de acesso ao banco de dados
│   └── utils.ts                    # Utilitários gerais
└── ARCHITECTURE.md                 # Este documento
```

## Padrões Arquiteturais

### Feature-Driven Design

Organizamos o código em torno de funcionalidades (features) em vez de tipos de arquivos. Cada módulo principal (como "contatos") contém seus próprios componentes, utilitários e tipos específicos.

### Component-Driven Development

Construímos a UI através de componentes reutilizáveis, seguindo uma abordagem bottom-up:
1. Componentes atômicos (buttons, inputs)
2. Componentes compostos (forms, cards)
3. Componentes de página (tabelas, dashboards)

### Context API para Gerenciamento de Estado

Utilizamos React Context API para gerenciar estados globais ou compartilhados entre componentes, especialmente para:
- Lista de contatos e operações CRUD
- Gestão de tags
- Estado de seleção

## Convenções de Código

### Nomenclatura

- **Componentes**: PascalCase (`ContatoForm.tsx`)
- **Hooks**: camelCase com prefixo "use" (`useContatos.ts`)
- **Utilitários**: camelCase (`formatarTelefone.ts`)
- **Tipos/Interfaces**: PascalCase (`Contato`, `TagProps`)
- **Contextos**: PascalCase com sufixo "Context" (`ContatosContext`)

### Estrutura de Arquivos

- **Componentes**:
  ```tsx
  // Imports
  import { useState } from 'react'
  
  // Types
  interface ComponentProps {}
  
  // Componente (com memoização quando apropriado)
  export const Component = React.memo(function Component(props: ComponentProps) {
    // Hooks
    // Handlers
    // Render
  })
  ```

### Estilização

Utilizamos Tailwind CSS com a abordagem "utility-first":
- Classes utilitárias diretamente nos elementos
- Componentes shadcn/ui como base de design system
- Variantes para padrões recorrentes

## Tecnologias Principais

- **Next.js**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Supabase**: Backend-as-a-Service (Auth, Database, Storage)
- **Tailwind CSS**: Framework CSS utility-first
- **shadcn/ui**: Componentes UI baseados em Radix UI
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de schemas

## Melhores Práticas

### Performance

- Memoização de componentes com `React.memo`
- Otimização de callbacks com `useCallback`
- Cálculos derivados com `useMemo`
- Carregamento sob demanda com Next.js dynamic imports

### Acessibilidade

- Uso de componentes acessíveis (shadcn/ui e Radix)
- Atributos ARIA apropriados
- Feedback visual e textual para usuários

### Organização do Código

- Separação de responsabilidades
- Componentes pequenos e focados
- Lógica de negócios separada da UI
- Reutilização através de hooks e componentes

## Histórico de Refatorações

### 2023-04-05: Reorganização do Módulo de Contatos

1. **Unificação de Componentes**:
   - Criação do componente `contato-dialog.tsx` que unifica as operações de criação e edição

2. **Otimização de Tipos**:
   - Migração de `types.tsx` para `types.ts`
   - Implementação de herança de tipos (ContatoBase → Contato)

3. **Melhoria de Performance**:
   - Implementação de memoização em componentes pesados
   - Uso de hooks de performance (useCallback, useMemo)

4. **Organização de Código**:
   - Extração de utilitários para o diretório `utils`
   - Criação de "barrel files" para módulos complexos
   - Documentação em README.md para cada módulo

---

*Este documento deve ser mantido atualizado à medida que a arquitetura evolui.* 