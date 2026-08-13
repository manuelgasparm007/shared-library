<div align="center">
  <br>
  <img src="./public/favicon.png" width="90" height="90" alt="Biblioteca Camomila Logo">
  <h1>Biblioteca Camomila</h1>
  <p><strong>Plataforma Digital Moderna de Gestão de Biblioteca Partilhada</strong></p>

  <p>
    <a href="https://biblioteca-camomila.vercel.app/"><img src="https://img.shields.io/badge/Live_Demo-Vercel-10b981?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel Live Demo"></a>
    <a href="./docs/USER_MANUAL.md"><img src="https://img.shields.io/badge/Manual-Documentação_Completa-6366f1?style=for-the-badge&logo=readme&logoColor=white" alt="Manual de Utilização"></a>
    <a href="#-níveis-de-acesso"><img src="https://img.shields.io/badge/Perfil-Bibliotecário_&_Leitor-f59e0b?style=for-the-badge" alt="Perfis de Acesso"></a>
  </p>

  <br>

  <p align="center">
    <a href="https://biblioteca-camomila.vercel.app/">🌐 <b>Aceder à Aplicação Web</b></a> &nbsp;•&nbsp;
    <a href="./docs/USER_MANUAL.md">📘 <b>Manual de Utilização</b></a> &nbsp;•&nbsp;
    <a href="#-funcionalidades-principais">✨ <b>Funcionalidades</b></a> &nbsp;•&nbsp;
    <a href="#-níveis-de-acesso">🔐 <b>Perfis</b></a> &nbsp;•&nbsp;
    <a href="#-informação-técnica--instalação-para-desenvolvedores--it">🛠️ <b>Área Técnica & IT</b></a>
  </p>
  <br>
</div>

---

## 📌 Apresentação do Sistema

A **Biblioteca Camomila** é uma solução web moderna, intuitiva e acessível, desenvolvida para simplificar a gestão de acervos literários, o catálogo de livros, as requisições/empréstimos e o registo de leitores.

Funciona de forma fluida em qualquer dispositivo — **computadores, telemóveis e tablets** — oferecendo uma experiência de utilização organizada, rápida e elegante.

---

## ✨ Funcionalidades Principais

| Módulo | Descrição & Funcionalidades | Detalhes no Manual |
| :--- | :--- | :---: |
| **📖 Catálogo Literário** | Alternância instantânea entre **🖼️ Galeria de Capas** e **📋 Tabela Detalhada**. Ordenação rápida por qualquer coluna e pesquisa automática por ISBN/capas via Google Books e Open Library APIs. | [📘 Ver Guia](./docs/USER_MANUAL.md#12-navegar-no-catálogo) |
| **🔄 Empréstimos & Devoluções** | Registo de requisições em segundos, cálculo automático de prazos de devolução, identificação visual de empréstimos em atraso e renovações de prazo com 1 clique. | [📘 Ver Guia](./docs/USER_MANUAL.md#22-registar-empréstimo-presencial) |
| **👥 Directório de Leitores** | Gestão completa de membros, fluxo de aprovação prévia de novas contas registadas e redefinição rápida de palavras-passe. | [📘 Ver Guia](./docs/USER_MANUAL.md#21-aprovação-de-novas-contas) |
| **📊 Painel de Controlo (Dashboard)** | Indicadores gerais em tempo real (KPIs de coleção, livros disponíveis, emprestados e em atraso), estatísticas por género e histórico das requisições mais recentes. | [📘 Ver Guia](./docs/USER_MANUAL.md#-2-guia-do-bibliotecário-administrador) |
| **🎨 Personalização & Mobile UI** | Seleção entre 5 temas visuais (*📜 Pergaminho Sépia*, *<img src="./public/favicon.png" width="16" height="16" align="absmiddle"> Camomila Verde*, *🌙 Midnight Escuro*, *☀️ Nórdico*, *💜 Cyber Violet*) e barra de navegação móvel ao alcance do polegar. | [📘 Ver Guia](./docs/USER_MANUAL.md#15-personalização-de-temas-visuais) |

---

## 🔐 Níveis de Acesso

<table>
  <thead>
    <tr>
      <th>Perfil de Utilizador</th>
      <th>Ecrã Inicial</th>
      <th>Permissões & Ações Disponíveis</th>
      <th>Manual Detalhado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>👑 Bibliotecário (Admin)</b></td>
      <td>📊 <i>Painel Principal</i></td>
      <td>Acesso total ao sistema: criação, edição e eliminação de livros, aprovação de leitores, registo de empréstimos e devoluções, cópias de segurança (JSON) e histórico auditável de notificações.</td>
      <td><a href="./docs/USER_MANUAL.md#-2-guia-do-bibliotecário-administrador">📘 Guia do Bibliotecário</a></td>
    </tr>
    <tr>
      <td><b>👤 Leitor (Membro)</b></td>
      <td>📖 <i>Catálogo de Livros</i></td>
      <td>Consulta e pesquisa no catálogo completo, acesso aos detalhes das obras, histórico de requisições pessoais (<i>Os Meus Empréstimos</i>) e alteração do tema visual.</td>
      <td><a href="./docs/USER_MANUAL.md#-1-guia-do-leitor-membro">📘 Guia do Leitor</a></td>
    </tr>
  </tbody>
</table>

---

<br>

<details>
<summary><b>🛠️ Informação Técnica & Instalação (Clique para expandir)</b></summary>

<br>

> [!NOTE]
> Esta secção destina-se exclusivamente a equipas técnicas, manutenção de servidores e desenvolvedores. Para o guia de utilização técnica detalhado, consulte o documento [`docs/DEVELOPER_GUIDE.md`](./docs/DEVELOPER_GUIDE.md).

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

</details>

---

<div align="center">
  <p>Desenvolvido para a <b>Biblioteca Camomila</b> <img src="./public/favicon.png" width="18" height="18" align="absmiddle" alt="Camomila Icon">. Todos os direitos reservados.</p>
</div>
