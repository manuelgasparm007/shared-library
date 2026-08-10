# 📚 Documentação Oficial - Biblioteca Camomila

Bem-vindo à documentação oficial da **Biblioteca Camomila**.

A documentação está dividida em duas áreas especializadas para atender tanto a **Leitores e Bibliotecários**, quanto a **Desenvolvedores e Administradores de TI**:

---

## 🗺️ Manuais Disponíveis

| Documento | Público-Alvo | Descrição & Conteúdos |
| :--- | :--- | :--- |
| 📘 [**USER_MANUAL.md**](USER_MANUAL.md) | **Leitores & Bibliotecários** | **Manual do Utilizador**: Guia de criação de conta, navegação no catálogo, ordenação de listas, empréstimos, aprovação de leitores pelo bibliotecário, devoluções, renovações e temas visuais. |
| 💻 [**DEVELOPER_GUIDE.md**](DEVELOPER_GUIDE.md) | **Desenvolvedores & TI** | **Guia Técnico e de Arquitetura**: Estrutura do código-fonte (Vite, ES Modules, CSS Glassmorphism), base de dados Supabase (PostgreSQL), compilação, testes e publicação gratuita ($0/ano) no GitHub Pages, Vercel ou Netlify. |

---

## 📌 Resumo Rápido do Sistema

### 🌿 Sobre a Biblioteca Camomila:
- **Catálogo Rico**: Pré-carregado com 20 obras do acervo inicial com imagens de capa, ISBN, editora, sinopse e localização na prateleira física.
- **Autenticação com Fecho de Segurança**: Acesso condicionado a login prévio, com suporte a registo de novos leitores e aprovação prévia pelo bibliotecário (`⏳ Pendente` / `✅ Aprovado`).
- **Vista de Tabela por Defeito & Ordenação**: O catálogo abre por defeito na vista de Tabela e suporta ordenação interativa de colunas e seletores dinâmicos.
- **Sincronização Cloud**: Integração opcional com **Supabase** via REST API (Push Sync e Pull Sync) para múltiplos utilizadores.
- **5 Temas Visuais**: Suporte a *Escuro (Midnight)*, *Claro (Nórdico)*, *Camomila (Verde)*, *Pergaminho (Sépia)* e *Violeta (Cyber)*.

---

## 🚀 Comandos de Arranque Rápido

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento (http://localhost:5173)
npm run dev

# 3. Compilar pacote optimizado para produção (pasta dist/)
npm run build

# 4. Testar build de produção localmente
npm run preview
```

---

*Para obter instruções detalhadas, consulte os manuais específicos em [**USER_MANUAL.md**](USER_MANUAL.md) e [**DEVELOPER_GUIDE.md**](DEVELOPER_GUIDE.md).*
