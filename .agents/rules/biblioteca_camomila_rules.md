# 🌿 Regras & Diretrizes - Biblioteca Camomila

## 1. Identidade do Autor Git
- **Autor**: `manuelgasparm007`
- **Email**: `manuelgasparm@gmail.com`
- **Regra**: Nunca utilizar emails corporativos secundários em commits neste repositório.

## 2. Documentação e README (Functional-First)
- Apresentar em primeiro lugar as secções funcionais direcionadas a clientes e administradores.
- Deixar a componente técnica para o final da documentação (em blocos desdobráveis `<details><summary>`).
- Utilizar emblemas com a imagem do favicon (`./public/favicon.png`).

## 3. Padrão de UX para Pop-Ups de Pesquisa & Formação de Livros
- Ao realizar pesquisas automáticas de livros por ISBN ou Título/Autor dentro de modais, **nunca fechar o formulário** nem forçar a navegação para o painel principal.
- Atualizar todos os campos do livro (*Título*, *Autor*, *Ano*, *ISBN*, *Capa*, *Sinopse*, *Localização*, *Géneros*) e manter o pop-up aberto para o utilizador rever.
- Apresentar avisos de duplicação *inline* sem fechar o modal.

## 4. Pesquisas em Português (PT-PT) & APIs de Livros
- Aplicar sempre a normalização de diacritos/acentos (`str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")`) em pesquisas por nome/autor em Português.
- Utilizar a **Open Library Bibkeys API** (`https://openlibrary.org/api/books?bibkeys=ISBN:...&format=json&jscmd=data`) como endpoint direto e rápido de ISBN.

## 5. Sessão do Utilizador & Integridade de Estado
- O método `logout()` deve limpar `this.currentUser = null`, `localStorage`, `sessionStorage` e cookies simultaneamente.
- Utilizar delegação global de eventos de clique para acionar o encerramento de sessão em qualquer dispositivo.
