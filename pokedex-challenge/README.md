# Pokédex Challenge

Uma aplicação web moderna desenvolvida em Angular que permite explorar e descobrir informações sobre Pokémon, utilizando a [PokéAPI](https://pokeapi.co/).

<img width="808" height="998" alt="image" src="https://github.com/user-attachments/assets/e037497a-f04e-4b21-bac2-062b4f5bf979" />
<img width="808" height="998" alt="image" src="https://github.com/user-attachments/assets/a8c6ba4c-4cf4-42bd-9d82-eb7a59f317bb" />
<img width="808" height="998" alt="image" src="https://github.com/user-attachments/assets/aa16913a-c5ce-4f8c-ab33-68c27e42a4b8" />

## 🚀 Características

- Lista paginada de Pokémon com busca
- Visualização detalhada de cada Pokémon
- Interface responsiva e acessível
- Gerenciamento de estado com Signals (novidade da versão)
- Sistema de loading e tratamento de erros
- Otimização de SEO

## 🛠️ Tecnologias Utilizadas

- Node v22+
- Angular v20+
- TypeScript
- RxJS
- Angular Signals
- SCSS
- Angular CLI

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/yuriandrade91/pokedex-challenge.git
```

2. Instale as dependências:
```bash
pnpm install
```

3. Inicie o servidor de desenvolvimento:
```bash
pnpm start
```

A aplicação estará disponível em `http://localhost:4200/`.

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── core/              # Serviços principais, guards, interceptors
│   │   ├── services/      # Serviços compartilhados
│   │   ├── interceptors/  # Interceptors HTTP
│   │   └── resolvers/     # Resolvers para validação de rotas
│   ├── features/          # Componentes principais por feature
│   │   ├── pokemon-list/  # Listagem de Pokémon
│   │   └── pokemon-detail/# Detalhes do Pokémon
│   └── shared/           # Componentes, pipes e modelos compartilhados
│       ├── components/    # Componentes reutilizáveis
│       ├── pipes/        # Pipes customizados
│       ├── directives/   # Diretivas compartilhadas
│       └── models/       # Interfaces e tipos
├── assets/              # Recursos estáticos
│   ├── images/         # Imagens e ícones
│   └── fonts/         # Fontes customizadas
├── styles/             # Estilos globais
│   ├── _variables.scss # Variáveis SCSS
│   ├── _mixins.scss   # Mixins SCSS
│   └── _themes.scss   # Temas da aplicação
└── environments/      # Configurações por ambiente
    ├── environment.ts
```

## 📁 Estrutura do Projeto Detalhada

### Core
#### Services
- **PokemonService**
  - Responsável por todas as chamadas à PokéAPI
  - Implementa cache de requisições
  - Métodos para listagem e detalhes de Pokémon
  - Tratamento de erros HTTP

- **LoadingService**
  - Gerencia estados de loading globais
  - Usa Signals para controle de estado
  - Métodos show/hide para indicar carregamento
  - Integração com interceptor HTTP

- **ErrorService**
  - Gerenciamento centralizado de erros
  - Tratamento específico por tipo de erro
  - Integração com toasts/snackbars
  - Logging de erros

#### Interceptors
- **LoadingInterceptor**
  - Controle automático do loading state
  - Integração com LoadingService
  - Tratamento de timeouts
  - Cancela requisições duplicadas

- **ErrorInterceptor**
  - Captura e trata erros HTTP
  - Formata mensagens de erro
  - Integração com ErrorService
  - Retry para falhas de rede

#### Resolvers
- **PokemonDetailResolver**
  - Valida parâmetros da rota
  - Previne navegação com IDs inválidos
  - Redirecionamento em caso de erro
  - Melhora UX evitando cargas desnecessárias

### Features
#### Pokemon List Component
- **Listagem Principal**
  - Implementa infinite scroll
  - Filtro e busca de Pokémon
  - Grid responsivo
  - Preview cards com animação

- **PokemonCardComponent**
  - Exibe informações básicas
  - Lazy loading de imagens
  - Animações hover
  - Link para detalhes

#### Pokemon Detail Component
- **Visualização Detalhada**
  - Tabs para diferentes informações
  - Gráficos de estatísticas
  - Informações da espécie
  - Galeria de imagens

### Shared
#### Components
- **LoadingSpinner**
  - Indicador visual customizado
  - Animação suave
  - Acessível via ARIA
  - Diferentes tamanhos

- **ErrorMessage**
  - Exibe erros formatados
  - Suporte a retry
  - Mensagens customizáveis
  - Feedback visual apropriado

#### Models
- **Pokemon**
  - Interface completa do Pokémon
  - Tipagem forte para API
  - Enums para tipos e stats
  - Helpers para formatação

- **PokemonSpecies**
  - Dados específicos da espécie
  - Descrições e características
  - Evolução chain
  - Localização habitat

### Assets
- **Images/**
  - Ícones e logos
  - Fallback images
  - Sprites default
  - Backgrounds

### Styles
- **_variables.scss**
  - Design tokens
  - Paleta de cores
  - Tipografia
  - Breakpoints

- **_mixins.scss**
  - Utilitários responsivos
  - Animações reutilizáveis
  - Estilos de cards
  - Grid systems

## 🏗️ Arquitetura e Decisões Técnicas

### Padrão de Arquitetura
- **Feature-based**: Organização do código por funcionalidade, facilitando a manutenção e escalabilidade.
- **Core Module**: Serviços singleton e funcionalidades essenciais da aplicação.
- **Shared Module**: Componentes e utilidades reutilizáveis.

### Estado da Aplicação
- Utilização de **Angular Signals** para gerenciamento de estado reativo.
- **RxJS** para operações assíncronas e composição de dados.

### Performance
- Lazy loading de módulos
- Tratamento de imagens com fallback
- Implementação de loading states
- Cache de requisições

### 📱 Design Responsivo
- **Mobile First**: Desenvolvimento priorizando dispositivos móveis
- **Grid System**: Uso de CSS Grid e Flexbox para layouts flexíveis
- **Media Queries**: Breakpoints estratégicos para diferentes dispositivos
- **Fluid Typography**: Textos adaptáveis com clamp() e unidades relativas
- **Touch Friendly**: Áreas de toque adequadas para interação mobile
- **Imagens Responsivas**: Otimização com srcset e lazy loading
- **Performance Mobile**: Otimizações específicas para conexões lentas

### 🔍 Estratégia de SEO
- **Meta Tags Dinâmicas**: Atualização por componente via Meta Service
- **Structured Data**: Implementação de Schema.org para rich snippets
- **Semantic HTML**: Uso apropriado de tags semânticas (header, nav, main, etc)
- **Performance Score**: Otimização para Core Web Vitals
- **SSR Ready**: Preparação para Server-Side Rendering
- **Canonical URLs**: Gestão adequada de URLs duplicadas
- **Sitemap**: Geração automática de sitemap.xml

### ♿ Acessibilidade (A11y)
- **ARIA Labels**: Uso apropriado de atributos aria
- **Keyboard Navigation**: Navegação completa via teclado
- **Focus Management**: Gestão adequada do foco
- **Color Contrast**: Conformidade WCAG para contraste
- **Screen Readers**: Textos alternativos e descrições
- **Reduced Motion**: Suporte a prefers-reduced-motion
- **Semantic Structure**: Hierarquia clara de headings
- **Error Handling**: Feedback claro de erros para leitores de tela

### 🤔 Por que essas escolhas?

#### PNPM
- **Performance Superior**: Armazenamento eficiente de dependências com hard links
- **Economia de Espaço**: Compartilhamento de pacotes entre projetos
- **Instalação Mais Rápida**: Sistema de cache otimizado
- **Segurança**: Estrutura não-plana de node_modules evita dependências fantasma
- **Consistência**: Strict mode por padrão garante determinismo nas instalações

#### Angular Signals
- **Reatividade Granular**: Atualizações precisas apenas onde necessário
- **Performance Melhorada**: Menos verificações de mudança comparado ao Zone.js
- **Código Mais Limpo**: Sintaxe declarativa e intuitiva
- **Debugging Facilitado**: Rastreamento explícito de mudanças de estado
- **Integração Angular**: Preparação para o futuro do framework

#### Resolvers
- **Validação Prévia**: Verificação de parâmetros antes do carregamento do componente
- **UX Melhorada**: Evita carregamento desnecessário de componentes
- **Performance**: Previne requisições desnecessárias
- **Navegação Inteligente**: Redirecionamento antecipado em caso de dados inválidos

#### Interceptors
- **DRY (Don't Repeat Yourself)**: Centralização de lógica comum de requisições
- **Consistência**: Tratamento padronizado de headers e erros
- **Performance**: Cache global de requisições


#### Environment
- **Segurança**: Proteção de chaves e endpoints sensíveis
- **Manutenibilidade**: Centralização de variáveis de configuração

### Boas Práticas
- TypeScript strict mode
- Interfaces bem definidas
- Resolvers para validação de rotas
- Tratamento de erros consistente
- Componentização com responsabilidades únicas

### 🔄 Fluxo de Dados

#### Listagem de Pokémon
1. Usuário acessa a página principal
2. PokemonListComponent inicializa
3. LoadingService ativa o estado de loading
4. PokemonService faz requisição paginada
5. LoadingInterceptor gerencia o estado de loading
6. Dados são processados e exibidos em cards
7. Infinite scroll monitora rolagem
8. Processo se repete para mais dados

#### Detalhes do Pokémon
1. Usuário clica em um Pokémon
2. Router ativa PokemonDetailResolver
3. Resolver valida o ID do Pokémon
4. Se válido, carrega PokemonDetailComponent
5. Requisições paralelas via forkJoin
   - Detalhes do Pokémon
   - Informações da espécie
6. Dados são processados e exibidos
7. SEO tags são atualizadas
8. Imagens são carregadas com fallback

#### Tratamento de Erros
1. ErrorInterceptor captura erro HTTP
2. ErrorService processa o erro
3. Mensagem apropriada é exibida
4. LoadingService é resetado
5. Usuário pode tentar novamente


## 🌟 Funcionalidades Principais

### Lista de Pokémon
- Paginação infinita
- Busca por nome
- Preview com tipo e número
- Loading states
- Tratamento de erros

### Detalhes do Pokémon
- Informações detalhadas
- Estatísticas
- Tipos e habilidades
- Descrição da espécie
- Imagens oficiais
- SEO otimizado

## 🤝 Contribuindo

### Conventional Commits

Este projeto segue a especificação do [Conventional Commits](https://www.conventionalcommits.org/), que estabelece um padrão para mensagens de commit. O formato básico é:

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé(s) opcional(is)]
```

#### Tipos de Commit
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Alterações na documentação
- `style`: Formatação, ponto e vírgula faltando; Não afeta o código
- `refactor`: Refatoração do código
- `test`: Adição ou correção de testes
- `chore`: Atualizações de build, configurações, etc
- `perf`: Melhorias de performance

#### Exemplos:
```bash
feat(pokemon-list): adiciona infinite scroll
fix(detail): corrige carregamento de imagens
docs: atualiza README com novas instruções
style: formata arquivos conforme styleguide
```

### Processo de Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feat/AmazingFeature`)
3. Commit suas mudanças seguindo o Conventional Commits
4. Push para a branch (`git push origin feat/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

