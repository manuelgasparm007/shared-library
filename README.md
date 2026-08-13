# 🌿 Biblioteca Camomila

> **Plataforma Digital de Gestão de Biblioteca Partilhada**  
> 🌐 **Aceder à Aplicação:** [https://biblioteca-camomila.vercel.app/](https://biblioteca-camomila.vercel.app/)

---

## 📌 Apresentação do Sistema

A **Biblioteca Camomila** é uma solução web moderna, intuitiva e acessível, desenvolvida para simplificar a gestão de acervos literários, o catálogo de livros, as requisições/empréstimos e o registo de leitores.

Funciona de forma fluida tanto em computadores como em telemóveis e tablets, oferecendo uma experiência de utilização organizada, rápida e elegante.

---

## ✨ Funcionalidades Principais (Visão Funcional)

### 📖 1. Catálogo Literário & Consulta de Livros
- **Vistas Personalizadas**: Alterne entre a vista em **🖼️ Galeria de Capas** e a vista em **📋 Tabela Detalhada**.
- **Ordenação Rápida**: Clique em qualquer coluna (ID, Título, Autor, Género, Ano, ISBN, Estado) para ordenar de A a Z, Z a A ou por datas.
- **⚡ Preenchimento Automático por ISBN / Título**: Ao adicionar um novo livro, o sistema pesquisa automaticamente em bases de dados mundiais (**Google Books** e **Open Library**) e preenche o autor, ano, sinopse e capa da obra.
- **Múltiplos Géneros**: Atribuição de várias categorias a uma mesma obra (ex: *Ficção Científica, Romance*).
- **Pesquisa em Tempo Real**: Encontre rapidamente qualquer obra pelo título, autor ou ISBN sem perder o foco de escrita.

### 🔄 2. Controlo de Empréstimos & Devoluções
- **Requisição Simples**: Registe o empréstimo de um livro a um leitor em poucos segundos.
- **Prazos Automáticos**: O sistema calcula a data limite de devolução e assinala visualmente os empréstimos **Em Atraso**.
- **Histórico & Renovação**: Acompanhe o histórico de requisições e renove prazos com 1 clique.

### 👥 3. Directório de Leitores & Aprovação de Contas
- **Gestão de Membros**: Lista completa de todos os utilizadores registados na biblioteca.
- **Aprovação de Novos Registos**: Os novos leitores que criam conta ficam em estado *Aguardar Aprovação* até serem validados pelo Bibliotecário.
- **Gestão de Palavras-Passe**: Opção direta nas definições e no diretório para redefinir palavras-passe de forma simples.

### 📊 4. Painel Principal (Dashboard)
- **Indicadores Rápidos (KPIs)**: Visualize imediatamente o número total de livros, quantos estão disponíveis, quantos estão emprestados e quantos estão em atraso.
- **Estatísticas por Género**: Gráficos visuais com a distribuição dos livros por categoria ordenados alfabeticamente.
- **Atividades Recentes**: Lista dos últimos empréstimos efetuados na biblioteca.

### 🎨 5. Personalização Visual & Experiência Mobile
- **Temas de Cores**: Escolha o seu estilo preferido (*📜 Pergaminho Sépia*, *🌿 Camomila Verde*, *🌙 Escuro Midnight*, *☀️ Claro Nórdico*, *💜 Violeta Cyber*).
- **📱 Navegação no Telemóvel**: Barra de navegação inferior estilo aplicação móvel para acesso rápido e confortável pelo polegar.

---

## 🔐 Níveis de Acesso

O sistema distingue automaticamente dois tipos de utilizadores:

1. **👑 Bibliotecário / Administrador**:
   - Acesso total: gestão do catálogo, criação/edição/eliminação de livros, aprovação de leitores, registo de empréstimos, cópias de segurança e histórico de notificações.
   - **Ecrã Inicial**: *Painel Principal (Dashboard)*.

2. **👤 Leitor / Membro**:
   - Acesso à consulta do catálogo, detalhes dos livros, histórico dos seus próprios empréstimos (*Os Meus Empréstimos*) e personalização do tema visual.
   - **Ecrã Inicial**: *Catálogo de Livros*.

---
<br>

---

## 🛠️ Informação Técnica & Instalação (Para Desenvolvedores / IT)

> [!NOTE]
> Esta secção destina-se exclusivamente a equipas técnicas, manutenção de servidores e desenvolvedores.

### ⚙️ Arquitetura & Tecnologias
- **Frontend**: HTML5, Vanilla JavaScript (ES6 Modules), CSS3 (Custom Properties & Glassmorphism).
- **Compilação & Bundle**: [Vite](https://vitejs.dev/)
- **Hospedagem & CI/CD**: [Vercel](https://vercel.com/)
- **Base de Dados Cloud**: [Supabase](https://supabase.com/) (PostgreSQL + REST API)
- **APIs Externas**: Google Books API & Open Library API

### 📜 Instalação e Execução Local
```bash
# 1. Clonar o repositório
git clone https://github.com/manuelgasparm007/shared-library.git
cd shared-library

# 2. Instalar dependências
npm install

# 3. Servidor de desenvolvimento
npm run dev

# 4. Compilar para produção
npm run build
```

### 🌩️ Configuração da Base de Dados Cloud (Supabase)
1. Execute o ficheiro [`supabase_schema.sql`](./supabase_schema.sql) no SQL Editor do Supabase para criar as tabelas `books`, `members` e `loans`.
2. Configure as variáveis de ambiente na Vercel (**Project Settings > Environment Variables**):
   - `VITE_SUPABASE_URL` = `https://<seu-projeto>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `<sua-anon-key>`

### 💾 Backup e Reposição de Dados
- **Backup JSON**: Exportação e importação completa de dados locais.
- **Excel Seed**: Suporte a repor os dados base a partir da folha Excel original [`Gestão de Biblioteca Partilhada excel.xlsx`](./Gestão%20de%20Biblioteca%20Partilhada%20excel.xlsx).

---

## 📄 Licença
Desenvolvido para a **Biblioteca Camomila** 🌿. Todos os direitos reservados.
