# To-Do App

Aplicação de gerenciamento de tarefas desenvolvida com Next.js, Tailwind CSS e shadcn/ui.

## Características

- Interface moderna e responsiva com shadcn/ui + Tailwind CSS
- Framework Next.js para renderização eficiente e roteamento
- Componentes reutilizáveis seguindo as melhores práticas
- Gerenciamento de tarefas com funcionalidades CRUD

## Estrutura do Projeto

- `src/app`: Páginas e rotas da aplicação
- `src/app/*/components`: Componentes específicos das páginas
- `src/components/ui`: Componentes de UI do shadcn
- `src/components/custom`: Componentes customizados da aplicação
- `src/lib`: Utilitários, hooks e funções helpers

## Como executar o projeto

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador para ver a aplicação.

## Tecnologias

- [Next.js](https://nextjs.org/) - Framework React para produção
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
- [shadcn/ui](https://ui.shadcn.com/) - Componentes de UI reutilizáveis
- [TypeScript](https://www.typescriptlang.org/) - Superset tipado de JavaScript

## Desenvolvimento

Para adicionar novos componentes do shadcn/ui:

```bash
# Exemplo: adicionar componente de botão
npx shadcn-ui@latest add button
```

## Deploy

Para fazer deploy da aplicação, recomendamos a [Vercel](https://vercel.com), plataforma dos criadores do Next.js.
