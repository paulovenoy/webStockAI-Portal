<div align="center">

# 🏭 Stock AI — Portal de Gestão Inteligente de Estoque
### *Solução de Alto Desempenho e Operação Offline para a Fábrica Três Irmãos*

[![React 19](https://img.shields.io/badge/React-19.2.7-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Offline First](https://img.shields.io/badge/Offline-Supported-10B981?style=for-the-badge&logo=pwa&logoColor=white)](#-modo-offline--sincronização-na-nuvem)
[![Vercel Status](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## 📌 Visão Geral

O **Stock AI** é um sistema completo e moderno de gestão de estoque e almoxarifado fabril. Desenvolvido para oferecer máxima clareza operacional aos gestores e funcionários da **Fábrica Três Irmãos (São Gonçalo - RJ)**, o portal combina inteligência visual, apoio à tomada de decisão e **operação garantida mesmo em ambientes sem conectividade com a internet**.

---

## ✨ Principais Funcionalidades

### 📊 1. Painel de Controle Simplificado (Dashboard)
- **KPIs Explicativos com Tooltips**: Métricas de *Categorias*, *Estoque Baixo*, *Custo Total em Insumos (R$)* e *Desperdício Acumulado (kg)* acompanhados de explicações simples ao clicar no ícone `(i)`.
- **Guia Rápido Integrado**: Seção interativa *"Como entender este painel?"* que detalha em linguagem clara o funcionamento dos indicadores.
- **Alertas FEFO (First Expire, First Out)**: Tabela de lotes com vencimento próximo (menos de 10 dias) com botão de ação rápida para **Dar Baixa (5kg)** e priorizar o insumo na produção.
- **Gráfico de Desperdício Semanal x Meta**: Visualização SVG do histórico de refugos comparado à meta de segurança de máximo 20 kg/semana.
- **Classificação Curva ABC**: Barra de progresso proporcional (Curva A - 80% custo, B - 15%, C - 5%).

### ⚡ 2. Modo Offline First & Sincronização em Nuvem
- **Detecção Automática de Rede**: Monitora o estado do sinal (`Online 🟢` vs `Offline 🔴`).
- **Simulador de Conexão Integrado**: Permite alternar entre os modos Online e Offline no topo da tela para testes operacionais.
- **Fila Local de Pendências**: Qualquer movimentação (baixa de estoque, registros ou relatórios) feita offline é gravada com segurança no `localStorage`.
- **Motor de Sync com 1-Clique**: Botão **"Sincronizar Agora"** para upload em lote das pendências locais para o servidor em nuvem assim que a internet retornar.

### 📦 3. Módulos Adicionais de Gestão
- 🏭 **Depósito e WMS Inteligente**: Mapeamento espacial de corredores, prateleiras e inventário por localização.
- 📦 **Controle de Compras**: Gestão de pedidos de reposição acionados automaticamente pelo nível mínimo.
- 🤖 **Assistente IA Chatbot**: Chatbot integrado para consulta de receitas, cálculo de insumos e tiragem de dúvidas da produção.
- 🔍 **Ferramentas de Qualidade (Ishikawa & 5W2H)**: Módulos dedicados à identificação da causa raiz de desperdícios e planos de ação corretiva.

---

## 🛠️ Tecnologias Utilizadas

- **Core**: React 19, TypeScript, React Router DOM v7
- **Bundler & Build Tool**: Vite
- **Estilização**: Vanilla CSS com variáveis customizadas, glassmorphism e temas dinâmicos
- **Ícones**: Lucide React
- **Armazenamento Local & Sync**: Custom React Offline Context Engine com fallback em `localStorage`

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js 18+ instalado no sistema.

### Passos

```bash
# 1. Clonar o repositório
git clone https://github.com/paulovenoy/webStockAI-Portal.git

# 2. Entrar no diretório do projeto
cd webStockAI-Portal

# 3. Instalar as dependências
npm install

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

O aplicativo estará rodando em `http://localhost:5173`.

---

## 🔨 Compilação e Build de Produção

Para gerar o pacote otimizado de produção:

```bash
npm run build
```

Para visualizar a versão de produção localmente:

```bash
npm run preview
```

---

## 🌐 Deploy na Vercel

O repositório está integrado com o **Vercel**. Cada novo `push` realizado na branch `main` dispara um deploy automático de produção.

---

<div align="center">
  <sub>Desenvolvido com ❤️ para a Fábrica Três Irmãos — São Gonçalo, RJ.</sub>
</div>
