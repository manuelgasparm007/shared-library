# 📘 Manual de Utilização - Biblioteca Camomila

Manual prático de utilização para **Leitores (Membros)** e **Bibliotecários (Administradores)**.

---

## 📌 Índice de Conteúdos

1. [Guia do Leitor (Membro)](#-1-guia-do-leitor-membro)
   - [Criar Conta de Leitor](#11-criar-conta-de-leitor)
   - [Navegar no Catálogo](#12-navegar-no-catálogo)
   - [Ordenar e Filtrar Livros](#13-ordenar-e-filtrar-livros)
   - [Consultar Os Meus Empréstimos](#14-consultar-os-meus-empréstimos)
   - [Personalização de Temas Visuais](#15-personalização-de-temas-visuais)
2. [Guia do Bibliotecário (Administrador)](#-2-guia-do-bibliotecário-administrador)
   - [Aprovação de Novas Contas](#21-aprovação-de-novas-contas)
   - [Registar Empréstimo Presencial](#22-registar-empréstimo-presencial)
   - [Processar Devoluções e Renovações](#23-processar-devoluções-e-renovações)
   - [Gestão do Acervo (Adicionar/Editar Livros)](#24-gestão-do-acervo)
   - [Sincronização Cloud e Cópias de Segurança](#25-sincronização-cloud-e-cópias-de-segurança)

---

## 👤 1. Guia do Leitor (Membro)

### 1.1 Criar Conta de Leitor
1. Na página inicial da biblioteca, clique na barra **✨ Criar Conta**.
2. Preencha o seu **Nome Completo**, **Endereço de Email**, **Telefone** e **Palavra-passe**.
3. Clique em **Registar Conta de Leitor**.
4. **Estado de Aprovação**: Para garantir a segurança do acervo, a sua conta fica temporariamente em estado `⏳ Aguarda Aprovação`. Assim que o bibliotecário aprovar o pedido, poderá iniciar sessão normalmente com o seu email.

### 1.2 Navegar no Catálogo
- Por defeito, o catálogo abre em **📋 Tabela** para facilitar a leitura rápida de dados.
- Pode alternar para a vista em **🖼️ Grelha** clicando no botão no topo do catálogo.
- Clique em **👁️ Detalhes** em qualquer livro para ler a sinopse completa, ISBN, editora, ano de publicação e a localização exata na prateleira física (ex: `📍 Prateleira A-1`).

### 1.3 Ordenar e Filtrar Livros
- **Ordenar por Dropdown**: Utilize o menu de ordenação no topo do catálogo:
  - 🔤 Título (A-Z) ou (Z-A)
  - 👤 Autor (A-Z)
  - 📅 Ano de Publicação (Mais Recente / Mais Antigo)
  - ✅ Disponíveis Primeiro
  - 🏷️ ID de Registo
- **Ordenação em Tabela**: Na vista de Tabela, clique diretamente no cabeçalho das colunas (`ID`, `Título`, `Autor`, `Ano`, `Estado`) para ordenar com setas visuais (`▲`/`▼`).
- **Filtros**: Selecione um género específico no menu de géneros ou filtre por estado de disponibilidade (*Disponível*, *Emprestado*, *Atrasado*).

### 1.4 Consultar Os Meus Empréstimos
- Aceda ao menu **🔄 Os Meus Empréstimos** na barra lateral esquerda.
- Visualize todos os livros que tem atualmente requisições ativas, respetivas datas de empréstimo e **datas limite de devolução**.
- Caso a data limite seja ultrapassada, o estado é marcado a vermelho como `⚠️ Em Atraso`.

### 1.5 Personalização de Temas Visuais
No canto superior direito do cabeçalho, selecione entre **5 temas visuais**:
- 🌙 **Escuro (Midnight)**: Vidro escuro com destaques índigo e esmeralda.
- ☀️ **Claro (Nórdico)**: Fundo claro com texto escuro e acabamento pastel.
- 🌿 **Camomila (Verde)**: Tons de floresta e esmeralda dedicados à Biblioteca Camomila.
- 📜 **Pergaminho (Sépia)**: Estilo papel antigo e tom sépia editorial.
- 💜 **Violeta (Cyber)**: Púrpura profundo e néon violeta.

---

## 👑 2. Guia do Bibliotecário (Administrador)

### 2.1 Aprovação de Novas Contas
1. Aceda ao menu **👥 Directório Leitores**.
2. Os leitores recém-registados aparecem com a etiqueta `⏳ Aguarda Aprovação`.
3. Clique no botão verde **`✅ Aprovar`** para ativar a conta do leitor instantaneamente.

### 2.2 Registar Empréstimo Presencial
Os empréstimos são efetuados presencialmente no balcão da biblioteca pelo bibliotecário:
1. Vá a **🔄 Empréstimos** -> Clique em **📖 Registar Empréstimo**.
2. Selecione o **Livro Disponível** e escolha o **Leitor Registado**.
3. Defina a duração do empréstimo:
   - Botões de predefinição rápida: **7 dias**, **14 dias**, **21 dias** ou **30 dias**.
   - Ou selecione uma data personalizada no calendário.
4. Clique em **Confirmar Empréstimo**. O estado do livro é atualizado automaticamente para `Emprestado`.

### 2.3 Processar Devoluções e Renovações
- **Registarde Devolução**: Na lista de empréstimos, clique em **📥 Devolver**. O livro regressa imediatamente ao estado `Disponível`.
- **Renovar Prazo**: Clique em **⏳ Renovar (+14 dias)** para estender o prazo de devolução de qualquer requisição.

### 2.4 Gestão do Acervo (Adicionar/Editar Livros)
- **Adicionar Livro**: Vá a **📖 Catálogo** -> Clique em **➕ Adicionar Livro**.
- Preencha os dados: Título, Autor, Género, Ano, Capa (URL), ISBN, Editora, Sinopse e Localização na Prateleira.
- **Editar / Eliminar**: Clique em **✏️ Editar** ou **🗑️ Eliminar** na tabela ou cartão do livro.

### 2.5 Sincronização Cloud e Cópias de Segurança
- Aceda a **⚙️ Definições & Backup**.
- **Enviar Dados para Supabase**: Clique em **⬆️ Enviar Todos os Dados para o Supabase (Push All)** para sincronizar livros, leitores e empréstimos com a base de dados cloud.
- **Exportar Cópia JSON**: Clique em **📥 Exportar Cópia de Segurança** para guardar um ficheiro `.json` com todo o acervo.
