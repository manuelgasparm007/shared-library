# Documentação - Biblioteca Camomila

Aplicação web moderna para a **Biblioteca Camomila**, desenvolvida com **Vite**, **JavaScript (ES Modules)**, **HTML5**, **CSS3 (Glassmorphism)**, com suporte a sincronização cloud via **Supabase** e persistência local.

---

## 📌 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitectura & Tecnologias](#arquitectura--tecnologias)
3. [Perfis de Acesso & Funcionalidades](#perfis-de-acesso--funcionalidades)
4. [Estrutura do Projecto](#estrutura-do-projecto)
5. [Instalação & Execução Local](#instalação--execução-local)
6. [Configuração de Base de Dados Cloud (Supabase)](#configuração-de-base-de-dados-cloud-supabase)
7. [Cópias de Segurança (Backup & Restore)](#cópias-de-segurança-backup--restore)

---

## 📖 Visão Geral

A aplicação **Biblioteca Camomila** foi concebida para simplificar a administração de acervos, o registo de leitores e a gestão de empréstimos/devoluções de livros. 

O sistema vem pré-carregado com os dados do ficheiro `Gestão de Biblioteca Partilhada excel.xlsx`, incluindo **20 obras**, **3 registos de empréstimo**, leitores inscritos e taxonomias completas em português (PT-PT).

---

## 🛠️ Arquitectura & Tecnologias

| Componente | Tecnologia | Função |
| :--- | :--- | :--- |
| **Ferramenta de Build / Servidor** | **Vite 5** | Servidor de desenvolvimento rápido e empacotamento estático para produção. |
| **Interface (UI)** | **HTML5 Semântico** + Elemento `<dialog>` | Estruturação com modais nativos acessíveis para adição, edição e empréstimos. |
| **Estilização & Design** | **CSS3 Vanilla (Glassmorphism)** | Sistema de design moderno com `backdrop-filter`, variáveis CSS, modo escuro/claro e micro-animações. |
| **Camada de Dados & Estado** | **ES Modules (`LibraryStore`)** | Gestão de estado reativa com suporte a `LocalStorage` e emissão de eventos. |
| **Sincronização Multi-Utilizador** | **Supabase (PostgreSQL)** | Base de dados cloud para sincronização em tempo real entre diferentes computadores e telemóveis. |

---

## 👥 Perfis de Acesso & Funcionalidades

### 👑 1. Bibliotecário / Administrador
- **Gestão do Acervo (CRUD)**: Adição, edição e remoção de livros no catálogo com campos enriquecidos (Título, Autor, Género, Ano, Estado, Imagem de Capa, ISBN, Editora, Sinopse e Prateleira).
- **Directório de Leitores**: Registo, edição e consulta de membros com contadores de empréstimos activos.
- **Processamento de Empréstimos**:
  - Empréstimo com durações predefinidas (7, 14, 21, 30 dias) ou data limite personalizada.
  - Devolução de livros com recálculo automático do estado para *Disponível*.
  - Renovação rápida de empréstimos em atraso ou activos (+14 dias).
- **Gestão de Dados**: Exportação e importação de cópias de segurança JSON e configuração das chaves da cloud Supabase.

### 👤 2. Leitor / Membro
- **Catálogo Online**: Pesquisa avançada por título, autor, ISBN ou localização de prateleira.
- **Filtros Dinâmicos**: Filtragem por género literário e estado de disponibilidade (*Disponível*, *Emprestado*, *Atrasado*).
- **Consulta de Detalhes**: Leitura de sinopses, localização física do exemplar na biblioteca e consulta das suas próprias requisições activas.

---

## 📂 Estrutura do Projecto

```text
shared-library/
├── docs/
│   └── README.md              # Manual de documentação do projecto
├── src/
│   ├── components/            # Renderizadores de componentes da UI
│   │   ├── auth.js            # Controlo de sessão e modais de login
│   │   ├── catalog.js         # Vista de catálogo (Grelha e Tabela)
│   │   ├── dashboard.js       # Painel principal com métricas KPI
│   │   ├── loans.js           # Gestão de empréstimos e devoluções
│   │   ├── members.js         # Directório de leitores registados
│   │   ├── settings.js        # Definições de backup e sincronização
│   │   └── toast.js           # Notificações visuais flutuantes
│   ├── data/
│   │   ├── initialData.json   # Dados pré-carregados do Excel
│   │   └── store.js           # Loja central de dados e persistência
│   ├── app.js                 # Ponto de entrada e encaminhador de vistas
│   └── style.css              # Sistema de design CSS master
├── dist/                      # Bundle optimizado para produção (npm run build)
├── index.html                 # Estrutura HTML principal da aplicação
├── package.json               # Dependências e scripts do projecto
├── supabase_schema.sql        # Script SQL para criação da base de dados cloud
└── vite.config.js             # Configurações do Vite
```

---

## 🚀 Instalação & Execução Local

### Pré-requisitos
- Node.js (v18.0.0 ou superior)
- npm (v9.0.0 ou superior)

### Passos de Instalação:
1. Abra o terminal no directório do projecto:
   ```bash
   cd c:\TFS\zDomo\shared-library
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Abra o navegador em `http://localhost:5173`.

### Compilar para Produção:
Para gerar os ficheiros optimizados de produção na pasta `dist/`:
```bash
npm run build
```

Para testar a versão de produção localmente antes de alojar:
```bash
npm run preview
```

---

## 🚀 Guia de Alojamento e Publicação (Deploy Gratuito)

Como a aplicação é compilada em ficheiros estáticos (HTML, CSS e JavaScript), pode ser alojada **100% gratuitamente ($0/ano)** em qualquer serviço de alojamento estático:

### Opção 1: Vercel (Recomendado - 1 Clique)
1. Instale o CLI do Vercel ou crie conta em [vercel.com](https://vercel.com).
2. Execute no terminal dentro da pasta do projecto:
   ```bash
   npx vercel
   ```
3. Siga as instruções no ecrã (Build Command: `npm run build`, Output Directory: `dist`).

### Opção 2: Netlify (Arrastar e Largar)
1. Crie conta gratuita em [netlify.com](https://netlify.com).
2. Execute `npm run build` na sua máquina.
3. No painel do Netlify, aceda a **Sites** -> Arraste e largue a pasta `dist` gerada.

### Opção 3: GitHub Pages
1. Guarde o código num repositório no GitHub.
2. Nas definições do repositório em **Settings -> Pages**:
   - Seleccione a source: **GitHub Actions** ou a branch `gh-pages` a apontar para a pasta `dist`.

## 🌩️ Configuração de Base de Dados Cloud (Supabase)

Para activar a sincronização em tempo real entre múltiplos utilizadores:

1. Crie uma conta gratuita em [Supabase.com](https://supabase.com).
2. Crie um novo projecto na plataforma.
3. Aceda ao **SQL Editor** no painel do Supabase.
4. Abra o ficheiro [`supabase_schema.sql`](file:///c:/TFS/zDomo/shared-library/supabase_schema.sql), copie todo o código SQL e cole-o no SQL Editor do Supabase.
5. Clique em **Run** para criar as tabelas (`books`, `members`, `loans`, `genres`).
6. Copie a **Project URL** e a **Anon Key** em *Project Settings -> API*.
7. Na aplicação web, vá ao menu **Definições & Backup**, insira as credenciais no formulário **Sincronização Cloud** e clique em **Guardar**.

---

## 💾 Cópias de Segurança (Backup & Restore)

A aplicação inclui um sistema completo de gestão de dados sem dependência externa:

- **Exportar Cópia de Segurança**: Clique em *Definições -> Exportar Cópia de Segurança (JSON)* para descarregar o ficheiro `biblioteca_backup_YYYY-MM-DD.json`.
- **Restaurar Cópia**: Clique em *Importar Ficheiro de Cópia (JSON)* e seleccione o ficheiro guardado anteriormente.
- **Repor Dados Iniciais**: Clique em *Repor Dados Iniciais do Excel* para restaurar o acervo original a qualquer momento.
