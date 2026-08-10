# 🌿 Biblioteca Camomila

> **Aplicação Web Moderna de Gestão de Biblioteca Partilhada**
> 🌐 **Live Demo (Vercel):** [https://biblioteca-camomila.vercel.app/](https://biblioteca-camomila.vercel.app/)

---

## 🚀 Sobre o Projeto

A **Biblioteca Camomila** é uma plataforma web completa, responsiva e elegante para a gestão de acervos literários, catálogo de livros, diretório de leitores e controlo de empréstimos e devoluções.

Desenhada com foco em experiência do utilizador (UX), estética moderna (Glassmorphism, temas personalizáveis como *Pergaminho Sépia*, *Camomila Verde*, *Midnight Glass*) e integração em tempo real com **Supabase** e APIs globais de livros (**Google Books** & **Open Library**).

---

## 🌐 Deploy & Tecnologias

- **Live URL**: [https://biblioteca-camomila.vercel.app/](https://biblioteca-camomila.vercel.app/)
- **Hospedagem**: [Vercel](https://vercel.com/)
- **Base de Dados Cloud**: [Supabase](https://supabase.com/) (PostgreSQL + REST API)
- **Ferramenta de Build**: [Vite](https://vitejs.dev/)
- **Frontend**: HTML5, Vanilla JavaScript (ES6 Modules), CSS3 (Custom Properties & Glassmorphism)

---

## ✨ Principais Funcionalidades

### 📖 Catálogo de Livros
- **Vistas Duplas**: Alternância instantânea entre **🖼️ Grelha (Gallery View)** e **📋 Tabela**.
- **Ordenação Bidirecional Completa**: Clique em qualquer cabeçalho de coluna (`ID`, `Título`, `Autor`, `Género`, `Ano`, `ISBN`, `Estado`) para ordenar por **Crescente (▲)** ou **Decrescente (▼)**.
- **Seleção Múltipla de Géneros**: Atribuição de múltiplos géneros a obras literárias via etiquetas interativas.
- **⚡ Pesquisa Automática Global**: Preenchimento automático de títulos, autores, ano, ISBN, capas e sinopses via **Google Books API** e **Open Library API**.
- **Sincronização em Tempo Real**: Estado do livro (`Disponível` vs. `Emprestado`) sincronizado instantaneamente com os empréstimos ativos.

### 🔄 Gestão de Empréstimos & Devoluções
- Registo de requisições de livros com cálculo automático de prazos de devolução.
- Controlo visual de prazos em atraso com identificadores `Em Atraso`.
- Ações rápidas de devolução e renovação de prazos de empréstimo.

### 👥 Directório de Leitores
- Lista completa de membros com estados de aprovação (`Conta Pendente`, `Aprovado`).
- Sistema de aprovação de novos registos efetuado por Bibliotecários.

### 📊 Painel de Controlo (Dashboard)
- **KPI Cards Interativos**: Métricas gerais (*Total da Coleção*, *Disponíveis*, *Emprestados*, *Em Atraso*) com navegação filtrada de 1 clique.
- **Distribuição por Género**: Gráfico de barras ordenado alfabeticamente.
- **Últimas Transações**: Lista dos 5 empréstimos mais recentes ordenados por ID decrescente.

### 🎨 Definições & Personalização
- **Motor de Temas**: Escolha entre 5 paletas de cores (*Pergaminho Sépia*, *Camomila Verde*, *Escuro Midnight*, *Claro Nórdico*, *Violeta Cyber*).
- **💾 Backup JSON**: Exportação e importação completa da base de dados local em formato JSON.
- **🌩️ Supabase Cloud Sync**: Envio e carregamento bidirecional de dados entre o armazenamento local e o Supabase.
- **📜 Registos de Popups & Notificações (Audit Log)**: Painel de auditoria para Bibliotecários listing todas as mensagens exibidas no sistema, com opções de pesquisa, filtro, exportação e limpeza.

---

## 🔐 Níveis de Acesso & Perfis

1. **👑 Bibliotecário (Librarian / Admin)**:
   - Acesso total a todas as funcionalidades: gestão do catálogo, criação/edição/eliminação de livros, gestão de empréstimos, aprovação de contas de membros, cópias de segurança JSON, sincronização cloud Supabase e histórico auditável de popups.
   - **Página Inicial de Login**: *Painel Principal (Dashboard)*.

2. **👤 Leitor (Patron / Member)**:
   - Visualização e pesquisa do catálogo completo de livros e detalhes das obras.
   - Acompanhamento dos seus empréstimos ativos (*Os Meus Empréstimos*).
   - Personalização do tema visual da aplicação.
   - **Página Inicial de Login**: *Catálogo de Livros*.

---

## 🛠️ Instalação e Execução Local

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- `npm` ou `yarn`

### Passos
```bash
# 1. Clonar o repositório
git clone <URL_DO_REPOSITORIO>
cd shared-library

# 2. Instalar dependências
npm install

# 3. Executar o servidor de desenvolvimento local
npm run dev

# 4. Compilar para produção
npm run build
```

---

## 🌩️ Configuração da Base de Dados Supabase

Para ativar a sincronização em nuvem com o **Supabase**:

1. Crie um projeto no [Supabase](https://supabase.com/).
2. Aceda ao **SQL Editor** no painel do Supabase e execute [`supabase_schema.sql`](./supabase_schema.sql) para criar as tabelas (`books`, `members`, `loans`).
3. **Automático para todos os utilizadores no Vercel**:
   - No painel da Vercel (**Project Settings > Environment Variables**), adicione:
     - `VITE_SUPABASE_URL` = `https://<seu-projeto>.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `<sua-anon-key>`
   - Desta forma, **todos os utilizadores e dispositivos que acedem à aplicação Vercel ficam automaticamente ligados ao Supabase sem ter de introduzir dados**.
4. **Manual nas Definições (Opcional)**:
   - Se preferir, qualquer Bibliotecário pode introduzir ou alterar o URL e a Key diretamente no painel **Definições > Sincronização Cloud (Supabase)**.

---

## 📁 Ficheiro de Importação Inicial
A aplicação suporta reposição para os dados de arranque extraídos da folha Excel original [`Gestão de Biblioteca Partilhada excel.xlsx`](./Gestão%20de%20Biblioteca%20Partilhada%20excel.xlsx).

---

## 📄 Licença
Este projeto foi desenvolvido para a **Biblioteca Camomila** 🌿. Todos os direitos reservados.
