-- ─── Tabelas ────────────────────────────────────────────────────────────────

CREATE TABLE public.empresas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome text NOT NULL,
  setor text,
  notas text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.contatos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome text NOT NULL,
  cargo text,
  empresa_id uuid REFERENCES public.empresas(id),
  empresa_nome text,
  tipo text NOT NULL CHECK (tipo IN ('empresa', 'consultoria_estrategia', 'conselho', 'headhunter')),
  canal text,
  contato_primario boolean DEFAULT false NOT NULL,
  ponte_contato_id uuid REFERENCES public.contatos(id),
  notas text,
  pipeline_stage text NOT NULL DEFAULT 'mapeado' CHECK (pipeline_stage IN ('mapeado', 'acionado', 'reuniao', 'followup', 'oportunidade', 'arquivado')),
  stage_updated_at timestamptz DEFAULT now(),
  proximo_passo text,
  proximo_passo_data date,
  ultima_interacao_at date,
  arquivado boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.reunioes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contato_id uuid REFERENCES public.contatos(id) ON DELETE CASCADE NOT NULL,
  data date NOT NULL,
  formato text CHECK (formato IN ('ligacao', 'cafe', 'video', 'mensagem', 'presencial')),
  tom text CHECK (tom IN ('muito_positivo', 'aberto', 'neutro', 'frio')),
  conteudo text,
  pendencias text,
  proximo_passo text NOT NULL DEFAULT '',
  proximo_passo_data date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.narrativa (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  posicionamento text,
  narrativa_saida text,
  contextos text[] DEFAULT '{}',
  setores text[] DEFAULT '{}',
  frases_aprovadas text[] DEFAULT '{}',
  versao integer DEFAULT 1,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ─── View ───────────────────────────────────────────────────────────────────

CREATE VIEW public.v_contatos_calor AS
SELECT
  c.id,
  c.user_id,
  c.nome,
  c.cargo,
  c.empresa_id,
  c.empresa_nome,
  c.tipo,
  c.canal,
  c.contato_primario,
  c.ponte_contato_id,
  c.notas,
  c.pipeline_stage,
  c.stage_updated_at,
  c.proximo_passo,
  c.proximo_passo_data,
  c.ultima_interacao_at,
  c.arquivado,
  c.created_at,
  c.updated_at,
  p.nome AS ponte_contato_nome,
  CASE
    WHEN r.proxima_reuniao IS NOT NULL THEN 'agendado'
    WHEN c.ultima_interacao_at >= (now() - '7 days'::interval) THEN 'quente'
    WHEN c.ultima_interacao_at >= (now() - '21 days'::interval) THEN 'morno'
    WHEN c.ultima_interacao_at >= (now() - '60 days'::interval) THEN 'frio'
    ELSE 'sem_contato'
  END AS calor,
  COALESCE(
    EXTRACT(day FROM now() - c.ultima_interacao_at)::integer,
    EXTRACT(day FROM now() - c.created_at)::integer
  ) AS dias_sem_contato,
  CASE
    WHEN c.proximo_passo_data < CURRENT_DATE THEN true
    ELSE false
  END AS followup_vencido
FROM contatos c
LEFT JOIN contatos p ON p.id = c.ponte_contato_id
LEFT JOIN (
  SELECT contato_id, min(data) AS proxima_reuniao
  FROM reunioes
  WHERE data > now()
  GROUP BY contato_id
) r ON r.contato_id = c.id;

-- ─── RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reunioes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.narrativa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuario ve seus contatos" ON public.contatos
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "usuario ve suas reunioes" ON public.reunioes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "usuario ve sua narrativa" ON public.narrativa
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "usuario ve suas empresas" ON public.empresas
  FOR ALL USING (auth.uid() = user_id);