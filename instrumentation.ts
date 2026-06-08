export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (!process.env.ANTHROPIC_API_KEY) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const envPath = path.join(process.cwd(), '.env.local');
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/ANTHROPIC_API_KEY=([^\r\n]+)/);
        if (match && match[1]) {
          process.env.ANTHROPIC_API_KEY = match[1].trim();
          console.log('[startup] ANTHROPIC_API_KEY carregada com sucesso ✓');
        }
      } catch (e) {
        console.error('[startup] Erro ao carregar .env.local:', e);
      }
    }
  }
}
