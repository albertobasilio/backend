# Concept Node: Sabor Inteligente MZ 🇲🇿

O **Sabor Inteligente MZ** é um ecossistema digital avançado que atua como um "Nutricionista de Geladeira Inteligente". O seu objetivo principal é transformar a forma como as famílias em Moçambique gerem a sua alimentação, utilizando Inteligência Artificial para combater o desperdício, promover a saúde e valorizar a culinária regional.

---

## 1. Visão Geral (The Vision)
O sistema resolve o problema do "o que vou cozinhar hoje?" através do reconhecimento visual de ingredientes. Ele não apenas sugere pratos, mas educa o utilizador sobre nutrição, organiza a sua rotina de compras e oferece receitas que respeitam a identidade cultural moçambicana.

---

## 2. Arquitetura do Sistema

### Frontend (O "Cérebro" Visual)
*   **Tecnologia:** React.js com Vite.
*   **Experiência:** Progressive Web App (PWA) - instalável em dispositivos mobile.
*   **Design:** UI Mobile-First, focada em alta performance e legibilidade, com suporte a animações suaves (Framer Motion).
*   **Estilo:** CSS Custom Properties (Vanilla) para um tema escuro (Dark Mode) premium e consistente.

### Backend (O "Coração" Lógico)
*   **Tecnologia:** Node.js com Express.
*   **IA:** Integração com modelos de visão computacional para reconhecimento de ingredientes e geração de receitas dinâmicas.
*   **Segurança:** Autenticação via JWT e níveis de acesso (RBAC) para utilizadores e administradores.

### Base de Dados (A "Memória")
*   **Motor:** PostgreSQL.
*   **Estrutura:** Esquema relacional otimizado para histórico de scans, planos alimentares e gestão de subscrições.

---

## 3. Módulos Principais

### 📸 Scan Inteligente (Core Feature)
Permite ao utilizador fotografar o interior da sua geladeira ou bancada. A IA identifica os ingredientes e sugere imediatamente o que pode ser feito com o que está disponível.

### 🍲 Catálogo de Receitas Regionais
Uma biblioteca de receitas focada em ingredientes locais (mandioca, amendoim, peixe, côco), dividida por níveis de dificuldade e tempo de preparação.

### 📅 Plano Alimentar e Nutrição
Ferramenta para organizar as refeições da semana, com cálculo automático de calorias e macros, ajudando utilizadores com restrições (diabéticos, atletas, etc.).

### 🛒 Lista de Compras Inteligente
Gera automaticamente a lista de itens em falta com base nos planos de refeição escolhidos, facilitando a ida ao mercado.

---

## 4. Ecossistema de Planos (Níveis de Acesso)

O sistema opera num modelo **Freemium**, garantindo acesso básico a todos e recursos avançados para assinantes:

1.  **Gratuito (Essencial):** 1 scan/dia e acesso básico a receitas.
2.  **Básico (Organizador):** 5 scans/dia, histórico completo e plano semanal.
3.  **Pro (Inteligente):** 10 scans/dia, nutrição detalhada e receitas exclusivas.
4.  **Premium (Master Chef):** 20 scans/dia, suporte prioritário e dicas de substituição por IA.

---

## 5. Diferenciais Estratégicos
*   **Offline Ready:** Como PWA, o sistema carrega rapidamente mesmo em ligações instáveis.
*   **Localização:** Foco total em Moçambique, desde o suporte via WhatsApp até às províncias integradas no perfil.
*   **IA Adaptativa:** O sistema aprende com as preferências e alergias do utilizador para ser cada vez mais preciso.

---

**Desenvolvido por:** Mr Beto (basilio.infomidia.co.mz)
**Versão:** 2.0 (Mobile-First Update)
**Localização:** Moçambique 🇲🇿
