# Recolocação — Sistema operacional de transição executiva

PWA mobile-first para gerenciar o processo de recolocação executiva.

## Stack

- **React 18** + TypeScript + Vite
- **Tailwind CSS** com design system customizado (DM Sans + DM Serif Display)
- **Supabase** — auth (magic link), banco Postgres com RLS, Edge Functions
- **Zustand** — estado global (auth, narrativa offline)
- **React Query** — server state com cache e optimistic updates
- **vite-plugin-pwa** — service worker, manifest, instalação no iPhone

## Rodar localmente

```bash
npm install
npm run dev
```

Sem `.env.local`, o app roda em **modo mock** com dados reais do processo.
Todas as telas funcionam, sem necessidade de Supabase.

## Conectar Supabase

1. Criar projeto em [supabase.com](https://supabase.com)
2. Copiar `.env.local.example` → `.env.local`
3. Preencher `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
4. Rodar as migrations em `supabase/migrations/`
5. `npm run dev`

## Instalar no iPhone

1. `npm run build && npm run preview`
2. Ou fazer deploy no Vercel (conectar GitHub, deploy automático)
3. Abrir URL no Safari do iPhone
4. Compartilhar → "Adicionar à Tela de Início"

## Estrutura

```
src/
├── pages/          # Telas (Dashboard, Pipeline, Contatos, etc.)
├── components/
│   ├── ui/         # Badge, Avatar, Button, Skeleton, Toast
│   ├── layout/     # AppShell, BottomNav, TopBar, FAB
│   └── contato/    # ContatoCard, FollowUpCard
├── stores/         # Zustand (auth, narrativa, ui)
├── hooks/          # React Query wrappers
├── services/       # API layer (Supabase + mock fallback)
├── types/          # TypeScript interfaces
├── utils/          # calor, formatters, ordenação
├── data/           # Mock data (contatos reais do processo)
└── lib/            # supabase client, queryClient
```

## Telas implementadas

| Tela | Rota | Status |
|------|------|--------|
| Login | `/login` | ✅ |
| Dashboard | `/` | ✅ |
| Pipeline | `/pipeline` | ✅ |
| Contatos (2 views) | `/contatos` | ✅ |
| Ficha do contato | `/contatos/:id` | ✅ |
| Registrar reunião | `/reuniao/nova` | ✅ |
| Narrativa | `/narrativa` | ✅ |
| Prep pré-reunião | `/reuniao/prep/:id` | 🔜 v1 |

## Próximos passos

- [ ] Tela de prep pré-reunião
- [ ] Formulário de novo contato
- [ ] Supabase migrations SQL
- [ ] Deploy no Vercel
- [ ] Instalação no iPhone
