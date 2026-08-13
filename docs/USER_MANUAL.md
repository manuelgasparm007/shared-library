# 📘 Manual de Utilização - Biblioteca Camomila

Manual prático de utilização por módulos para **Leitores (Membros)** e **Bibliotecários (Administradores)**.

---

## 📌 Índice de Módulos

1. [📖 1. Catálogo Literário & Consulta de Livros](#1-catálogo-literário--consulta-de-livros)
2. [🔄 2. Controlo de Empréstimos & Devoluções](#2-controlo-de-empréstimos--devoluções)
3. [👥 3. Directório de Leitores & Contas](#3-directório-de-leitores--contas)
4. [📊 4. Painel Principal (Dashboard)](#4-painel-principal-dashboard)
5. [🎨 5. Personalização Visual & Experiência Mobile](#5-personalização-visual--experiência-mobile)
6. [⚙️ 6. Definições, Auditoria & Sincronização Cloud (Admin)](#6-definições-auditoria--sincronização-cloud-admin)

---

## 📖 1. Catálogo Literário & Consulta de Livros

O catálogo é o núcleo central da coleção literária da Biblioteca Camomila.

### 1.1 Vistas Duplas (Grelha vs. Tabela)
- **📋 Vista em Tabela**: Apresenta todos os livros numa lista estruturada com colunas legíveis para leitura rápida de dados.
- **🖼️ Vista em Galeria**: Exibe capas de livros em cartões visuais interativos.
- Alterne instantaneamente entre as duas vistas clicando nos botões de visualização no topo do catálogo.

### 1.2 Ordenação Bidirecional Completa
- **Ordenação por Coluna**: Na vista de tabela, clique no cabeçalho de qualquer coluna (`ID`, `Título`, `Autor`, `Género`, `Ano`, `ISBN`, `Estado`) para alternar a ordenação entre **Crescente (▲)** e **Decrescente (▼)**.
- **Menu Dropdown**: Utilize o menu de ordenação para seleções rápidas como *Título (A-Z)*, *Mais Recente* ou *Disponíveis Primeiro*.

### 1.3 ⚡ Preenchimento Automático por ISBN / Título
1. Ao adicionar um novo livro, introduza o **ISBN** ou o **Título**.
2. Clique no botão **⚡ Procurar Dados (API)**.
3. O sistema pesquisa automaticamente nas bases de dados mundiais (**Google Books** e **Open Library**) e preenche o autor, ano de publicação, editora, sinopse e capa da obra.

### 1.4 Seleção Múltipla de Géneros
- Uma mesma obra literária pode ser associada a múltiplas categorias (ex: *Ficção Científica*, *Romance*, *Aventura*).
- As categorias aparecem destacadas no detalhe do livro em etiquetas de género interativas.

### 1.5 Ficha de Detalhes & Localização Física
- Clique em **👁️ Detalhes** em qualquer obra para consultar a sinopse, editora, ISBN e a localização física exata na biblioteca (ex: `📍 Prateleira A-1`).

---

## 🔄 2. Controlo de Empréstimos & Devoluções

Gestão de requisições presenciais e acompanhamento de prazos de devolução.

### 2.1 Registar Empréstimo Presencial (Bibliotecário)
1. Vá ao menu **🔄 Empréstimos** -> Clique no botão **📖 Registar Empréstimo**.
2. Selecione a obra da lista de **Livros Disponíveis**.
3. Selecione o **Leitor Registado**.
4. Defina o prazo de devolução utilizando as opções rápidas (**7 dias**, **14 dias**, **21 dias** ou **30 dias**) ou escolha uma data personalizada.
5. Clique em **Confirmar Empréstimo**. O estado do livro é atualizado automaticamente para `Emprestado`.

### 2.2 Consultar Os Meus Empréstimos (Leitor)
- Os leitores autenticados acedem ao menu **🔄 Os Meus Empréstimos** para visualizar os livros atualmente requisitados, a data de empréstimo e a data limite para entrega.

### 2.3 Processar Devoluções e Renovações
- **Devolver Livro**: Clique no botão **📥 Devolver** na lista de empréstimos. O livro regressa imediatamente ao estado `Disponível`.
- **Renovar Prazo**: Clique no botão **⏳ Renovar (+14 dias)** para estender o prazo de devolução de uma requisição.

### 2.4 Alertas Visuais de Atraso
- Empréstimos que ultrapassem a data limite são destacados automaticamente com a etiqueta vermelha `⚠️ Em Atraso`.

---

## 👥 3. Directório de Leitores & Contas

Gestão do registo de membros, acessos e palavras-passe.

### 3.1 Registar Conta de Leitor
1. No ecrã inicial, aceda ao separador **✨ Criar Conta**.
2. Preencha o **Nome Completo**, **Email**, **Telefone** e **Palavra-passe**.
3. Após o registo, a conta fica temporariamente no estado `⏳ Aguarda Aprovação`.

### 3.2 Aprovação de Novas Contas (Bibliotecário)
1. Aceda ao menu **👥 Directório Leitores**.
2. Localize os leitores assinalados com `⏳ Aguarda Aprovação`.
3. Clique em **`✅ Aprovar`** para ativar a conta do leitor.

### 3.3 Alteração & Reposição de Palavras-Passe
- **Todos os Utilizadores**: Podem atualizar a sua palavra-passe no menu **⚙️ Definições > Alterar Palavra-Passe**.
- **Bibliotecários**: Podem redefinir diretamente a palavra-passe de qualquer leitor no **Directório de Leitores** clicando no ícone **`🔑`**.

---

## 📊 4. Painel Principal (Dashboard)

Central de controlo visual e métricas gerais da biblioteca (visível para Bibliotecários).

### 4.1 Indicadores Rápidos (KPIs)
- **Total da Coleção**: Número global de livros registados.
- **Disponíveis**: Quantidade de obras prontas para requisição.
- **Emprestados**: Livros atualmente requisitados por leitores.
- **Em Atraso**: Alertas imediatos de requisições fora do prazo.
- *Dica*: Clicar em qualquer indicador filtra automaticamente o catálogo.

### 4.2 Estatísticas por Género & Histórico
- Gráficos de barras com a distribuição dos livros por categoria ordenados alfabeticamente.
- Lista dos últimos 5 empréstimos registados no sistema.

---

## 🎨 5. Personalização Visual & Experiência Mobile

Adaptação estética e facilidade de navegação no telemóvel.

### 5.1 Motores de Temas de Cores
Aceda às **Definições** para alterar o tema visual da aplicação:
- 📜 **Pergaminho (Sépia)**: Papel clássico e tom editorial sépia (predefinição).
- <img src="../public/favicon.png" width="16" height="16" align="absmiddle"> **Camomila (Verde)**: Tons naturais inspirados na Biblioteca Camomila.
- 🌙 **Escuro (Midnight)**: Fundo escuro com acabamento vidro e reflexos índigo.
- ☀️ **Claro (Nórdico)**: Interface clara e minimalista.
- 💜 **Violeta (Cyber)**: Néon violeta e púrpura moderno.

### 5.2 📱 Barra de Navegação Inferior Mobile
- Em ecrãs móveis (smartphones), surge uma barra fixa na parte inferior do ecrã para alternar entre os módulos (*Painel*, *Catálogo*, *Leitores*, *Empréstimos*, *Definições*) confortavelmente com o polegar.

---

## ⚙️ 6. Definições, Auditoria & Sincronização Cloud (Admin)

Funcionalidades avançadas de administração de dados.

### 6.1 Cópias de Segurança (Backup JSON & Reposição)
- **📥 Exportar Backup**: Descarrega um ficheiro `.json` completo com todos os livros, leitores e empréstimos.
- **📤 Importar Backup**: Carrega um ficheiro de cópia prévio.
- **🔄 Repor Excel**: Restaura a base de dados para a coleção original do ficheiro Excel.

### 6.2 🌩️ Sincronização Cloud Supabase
- Conexão em tempo real a uma base de dados Supabase para sincronizar dados entre múltiplos computadores e telemóveis.
- Permite enviar todos os dados locais (**Push All**) ou descarregar dados remotos (**Pull Remote**).

### 6.3 📜 Registos de Notificações & Popups (Audit Log)
- Painel de auditoria que regista todas as mensagens popups apresentadas no sistema (data, hora, tipo de evento e utilizador).
- Inclui pesquisa em tempo real, filtro por tipo (*Sucesso*, *Erro*, *Informação*), exportação JSON e limpeza de registos.

---

<div align="center">
  <p>Desenvolvido para a <b>Biblioteca Camomila</b> <img src="../public/favicon.png" width="18" height="18" align="absmiddle" alt="Camomila Icon">. Todos os direitos reservados.</p>
</div>
