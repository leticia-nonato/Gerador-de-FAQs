# FAQ Generator com IA

Gere FAQs profissionais para qualquer site usando scraping de conteúdo e a API da Anthropic (Claude).

## Funcionalidades

- **Extração de Conteúdo**: Insira uma URL e extraia automaticamente o conteúdo da página
- **Geração de FAQs**: Claude analisa o conteúdo e sugere perguntas e respostas relevantes
- **Perguntas Personalizadas**: Adicione suas próprias perguntas e deixe o Claude respondê-las
- **Links Internos**: Insira links internos e o Claude os adiciona automaticamente nas respostas
- **Exportação JSON**: Exporte as FAQs em formato JSON pronto para uso

## Configuração

### 1. Obter a chave da API

Acesse [console.anthropic.com](https://console.anthropic.com) e crie uma conta. Na seção **API Keys**, gere uma nova chave de API.

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha com sua chave:

```bash
cp .env.local.example .env.local
```

Abra `.env.local` e substitua `your_api_key_here` pela sua chave da API:

```
ANTHROPIC_API_KEY=sk-ant-...sua-chave-aqui...
```

### 3. Instalar dependências

```bash
npm install
```

### 4. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

### 5. Acessar a aplicação

Abra seu navegador em [http://localhost:3000](http://localhost:3000).

## Como usar

1. **Passo 1 - Conteúdo**: Cole a URL do site que deseja gerar FAQs. Clique em "Extrair Conteúdo" para fazer o scraping da página.

2. **Passo 2 - Gerar FAQs**: Clique em "Gerar FAQs Automaticamente" para que o Claude analise o conteúdo e sugira perguntas. Opcionalmente, adicione suas próprias perguntas na área de texto e clique em "Gerar Respostas".

3. **Passo 3 - Links Internos**: Adicione pares de URL + rótulo de páginas internas do seu site. Clique em "Inserir Links nas Respostas" e o Claude adicionará os links relevantes nas respostas.

4. **Exportar**: Clique em "Copiar JSON" para copiar as FAQs em formato JSON para uso no seu site.

## Stack tecnológica

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Anthropic SDK** (claude-sonnet-4-6)
- **Cheerio** (scraping server-side)
