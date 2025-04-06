# Changelog

Todas as mudanças significativas neste projeto serão documentadas neste arquivo.

## [1.1.0] - 2024-04-06

### Adicionado

#### Módulo de Campanhas

- **Gerenciamento de ações para campanhas**:
  - Botão para iniciar campanha (muda status para "ativa")
  - Botão para pausar campanha (muda status para "pausada")
  - Botão para concluir campanha (muda status para "concluida")
  - Diálogo de confirmação para excluir campanha
  - Feedback visual durante as operações (loading states)

- **Sistema de filtros por status**:
  - Tabs para filtrar campanhas por status
  - Exibição de contador para cada categoria de status
  - Filtros para: Todas, Rascunho, Agendadas, Ativas, Pausadas, Concluídas, Canceladas
  - Estado de vazio aprimorado para cada filtro

- **Melhorias de UI/UX**:
  - Cores diferenciadas para cada status (verde para ativas, amarelo para pausadas, etc.)
  - Interface responsiva para diferentes tamanhos de tela
  - Botões contextuais que só aparecem quando a ação é relevante para o status atual
  - Integração com sistema de notificações toast para feedback ao usuário

### Corrigido

- Correção de problemas de tipagem nos componentes
- Remoção de imports não utilizados (Button, AlertCircle, Calendar, TagCompactList)
- Correção nas referências a tipos nos arquivos de contexto
- Correção na exibição dos dados do contexto de campanhas
- Resolução de problemas de hidratação em componentes client-side

### Refatorado

- Movidos componentes para diretórios específicos seguindo padrão da aplicação
- Implementação de função específica para atualização de status (updateCampanhaStatus)
- Adoção de mapeamento de tipos mais consistente entre a API e frontend
- Melhoria na reutilização de componentes com uso de renderCampanhasList
- Adição de estados temporários de loading para melhor experiência do usuário

## [1.0.0] - 2024-04-05

### Adicionado

- Refatoração da estrutura de componentes
- Filtro global na tabela de contatos com suporte a tags
- Busca avançada com suporte a tags

### Corrigido

- Aplicação de tags e preseleção no gerenciador de tags
- Problemas de acessibilidade e tipagem nos componentes
- Abertura do diálogo de criação de tags
- Atualização de referência do campo de busca para camelCase

### Refatorado

- Unificação dos diálogos de tags
- Reorganização de componentes na pasta contatos
- Eliminação de redundâncias na estrutura do projeto 