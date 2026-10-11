import type { Plugin, ViteDevServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// @ts-expect-error importing local js module for server
import { handleChatRequest, getAIStatus } from '../server/aiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvFiles() {
  const envPaths = [
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '.env')
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx !== -1) {
              const key = trimmed.slice(0, eqIdx).trim();
              const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
              if (!process.env[key]) {
                process.env[key] = val;
              }
            }
          }
        }
      } catch {
        // ignore
      }
    }
  }
}

export function rootyChatPlugin(): Plugin {
  return {
    name: 'rooty-chat-api',
    configureServer(server: ViteDevServer) {
      loadEnvFiles();

      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        const url = new URL(req.url, 'http://localhost');

        if (url.pathname === '/api/chat/status' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(getAIStatus()));
          return;
        }

        if (url.pathname === '/api/chat' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });

          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const messages = parsed.messages || [];
              const context = parsed.context || {};

              if (!Array.isArray(messages) || messages.length === 0) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Messages array is required.' }));
                return;
              }

              const result = await handleChatRequest(messages, context);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err: unknown) {
              const error = err as Error;
              console.error('[Rooty Plugin Error]:', error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Internal Server Error', message: error.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}
