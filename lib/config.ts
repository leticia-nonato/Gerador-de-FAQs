import fs from 'fs';
import path from 'path';

let cachedKey: string | null = null;

export function getAnthropicKey(): string {
  // Tenta process.env primeiro
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }

  // Se não encontrou, lê o .env.local diretamente
  if (cachedKey) return cachedKey;

  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/ANTHROPIC_API_KEY=([^\r\n]+)/);
    if (match && match[1]) {
      cachedKey = match[1].trim();
      console.log('=== Chave lida do arquivo:', cachedKey.substring(0, 20) + '...');
      return cachedKey;
    }
  } catch (e) {
    console.error('Erro ao ler .env.local:', e);
  }

  throw new Error('ANTHROPIC_API_KEY não encontrada');
}
