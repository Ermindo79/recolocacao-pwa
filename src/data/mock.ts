import type { Contato, Reuniao, Narrativa, DashboardData, Empresa } from '../types'

export const MOCK_EMPRESAS: Empresa[] = [
  { id: 'e1', user_id: 'u1', nome: 'Spencer Stuart', setor: 'Headhunting', created_at: '2026-02-10T00:00:00Z' },
  { id: 'e2', user_id: 'u1', nome: 'Expert Recruiting Partners', setor: 'Headhunting', created_at: '2026-02-10T00:00:00Z' },
  { id: 'e3', user_id: 'u1', nome: 'Fesa Group', setor: 'Headhunting', created_at: '2026-02-10T00:00:00Z' },
  { id: 'e4', user_id: 'u1', nome: 'ZRG Partners', setor: 'Headhunting', created_at: '2026-02-10T00:00:00Z' },
  { id: 'e5', user_id: 'u1', nome: 'Claro', setor: 'Telecomunicações', created_at: '2026-02-10T00:00:00Z' },
]

const hoje = new Date()
const diasAtras = (n: number) => {
  const d = new Date(hoje); d.setDate(d.getDate() - n); return d.toISOString()
}
const diasFrente = (n: number) => {
  const d = new Date(hoje); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0]
}

export const MOCK_CONTATOS: Contato[] = [
  {
    id: 'c1', user_id: 'u1',
    nome: 'Leandro Pedrosa',
    empresa_nome: 'Spencer Stuart', empresa_id: 'e1',
    cargo: 'Managing Partner',
    tipo: 'headhunter', canal: 'whatsapp',
    contato_primario: true,
    pipeline_stage: 'reuniao',
    stage_updated_at: diasAtras(8),
    proximo_passo: 'Café presencial em SP',
    proximo_passo_data: diasFrente(5),
    ultima_interacao_at: diasAtras(3),
    arquivado: false, created_at: diasAtras(40), updated_at: diasAtras(3),
    calor: 'quente', dias_sem_contato: 3, followup_vencido: false,
    notas: 'Foi ele quem me colocou na Emive. Muito satisfeito com o processo. Não precisa de referência do fundador.',
  },
  {
    id: 'c2', user_id: 'u1',
    nome: 'Carlos Augusto',
    empresa_nome: 'Expert Recruiting Partners', empresa_id: 'e2',
    cargo: 'Sócio',
    tipo: 'headhunter', canal: 'email',
    contato_primario: false,
    ponte_contato_id: 'c6',
    ponte_contato: { id: 'c6', nome: 'Eduardo Guedes' },
    pipeline_stage: 'followup',
    stage_updated_at: diasAtras(12),
    proximo_passo: 'Follow-up sobre CV enviado',
    proximo_passo_data: diasAtras(2),
    ultima_interacao_at: diasAtras(7),
    arquivado: false, created_at: diasAtras(35), updated_at: diasAtras(7),
    calor: 'morno', dias_sem_contato: 7, followup_vencido: true,
    notas: 'Reunião de 1h30 — sinal positivo. CV enviado em 03/04.',
  },
  {
    id: 'c3', user_id: 'u1',
    nome: 'Pedro Freitas',
    empresa_nome: 'Fesa Group', empresa_id: 'e3',
    cargo: 'Sócio — Serviços e Tecnologia',
    tipo: 'headhunter', canal: 'email',
    contato_primario: false,
    ponte_contato_id: 'c6',
    ponte_contato: { id: 'c6', nome: 'Eduardo Guedes' },
    pipeline_stage: 'reuniao',
    stage_updated_at: diasAtras(5),
    proximo_passo: 'Aguardar retorno após primeira reunião',
    proximo_passo_data: diasFrente(7),
    ultima_interacao_at: diasAtras(5),
    arquivado: false, created_at: diasAtras(30), updated_at: diasAtras(5),
    calor: 'morno', dias_sem_contato: 5, followup_vencido: false,
    notas: 'Indicado internamente pela Gabriela. Primeiro contato.',
  },
  {
    id: 'c4', user_id: 'u1',
    nome: 'Lígia Biamino',
    empresa_nome: 'ZRG Partners', empresa_id: 'e4',
    cargo: 'Principal — TMT',
    tipo: 'headhunter', canal: 'linkedin',
    contato_primario: false,
    ponte_contato_id: 'c7',
    ponte_contato: { id: 'c7', nome: 'Fabrizio Bozzetto' },
    pipeline_stage: 'acionado',
    stage_updated_at: diasAtras(6),
    proximo_passo: 'Aguardar resposta ao InMail',
    proximo_passo_data: diasAtras(1),
    ultima_interacao_at: diasAtras(6),
    arquivado: false, created_at: diasAtras(28), updated_at: diasAtras(6),
    calor: 'frio', dias_sem_contato: 6, followup_vencido: true,
    notas: 'CV enviado pelo Fabrizio. Respondeu "Bom perfil". InMail enviado.',
  },
  {
    id: 'c5', user_id: 'u1',
    nome: 'Márcio Carvalho',
    empresa_nome: 'Claro', empresa_id: 'e5',
    cargo: 'VP Comercial',
    tipo: 'empresa', canal: 'whatsapp',
    contato_primario: false,
    ponte_contato_id: 'c6',
    ponte_contato: { id: 'c6', nome: 'Eduardo Guedes' },
    pipeline_stage: 'mapeado',
    stage_updated_at: diasAtras(20),
    proximo_passo: 'Aguardar Eduardo fazer contato',
    proximo_passo_data: diasFrente(14),
    ultima_interacao_at: diasAtras(20),
    arquivado: false, created_at: diasAtras(20), updated_at: diasAtras(20),
    calor: 'frio', dias_sem_contato: 20, followup_vencido: false,
  },
  {
    id: 'c6', user_id: 'u1',
    nome: 'Eduardo Guedes',
    empresa_nome: 'Independente',
    cargo: 'Executivo',
    tipo: 'consultoria', canal: 'whatsapp',
    contato_primario: true,
    pipeline_stage: 'followup',
    stage_updated_at: diasAtras(10),
    proximo_passo: 'Atualizar sobre desdobramentos',
    proximo_passo_data: diasAtras(3),
    ultima_interacao_at: diasAtras(10),
    arquivado: false, created_at: diasAtras(50), updated_at: diasAtras(10),
    calor: 'morno', dias_sem_contato: 10, followup_vencido: true,
    notas: 'Amigo de longa data. Disparou CV para rede. Aliado principal do processo.',
  },
  {
    id: 'c7', user_id: 'u1',
    nome: 'Fabrizio Bozzetto',
    empresa_nome: 'Independente',
    cargo: 'Executivo',
    tipo: 'consultoria', canal: 'linkedin',
    contato_primario: true,
    pipeline_stage: 'acionado',
    stage_updated_at: diasAtras(8),
    proximo_passo: 'Verificar desdobramento com Lígia',
    proximo_passo_data: diasFrente(3),
    ultima_interacao_at: diasAtras(8),
    arquivado: false, created_at: diasAtras(35), updated_at: diasAtras(8),
    calor: 'morno', dias_sem_contato: 8, followup_vencido: false,
  },
]

export const MOCK_REUNIOES: Reuniao[] = [
  {
    id: 'r1', user_id: 'u1', contato_id: 'c1',
    contato: { id: 'c1', nome: 'Leandro Pedrosa', empresa_nome: 'Spencer Stuart', tipo: 'headhunter' },
    data: diasAtras(3).split('T')[0],
    formato: 'ligacao', tom: 'aberto',
    conteudo: 'Conversa de 40 minutos, aberta e tranquila. Disse que não precisava de referência do fundador: "sei o que você fez lá". Falou que meu nome está surgindo no mercado.',
    pendencias: 'Confirmar data do café em SP',
    proximo_passo: 'Café presencial em SP',
    proximo_passo_data: diasFrente(5),
    created_at: diasAtras(3),
  },
  {
    id: 'r2', user_id: 'u1', contato_id: 'c2',
    contato: { id: 'c2', nome: 'Carlos Augusto', empresa_nome: 'Expert Recruiting Partners', tipo: 'headhunter' },
    data: diasAtras(7).split('T')[0],
    formato: 'presencial', tom: 'muito_positivo',
    conteudo: 'Reunião presencial no escritório. Marcada para 30 min, durou 1h30. Sinal muito positivo. Abordou saída da Emive — narrativa de mudança societária aceita tranquilamente.',
    pendencias: 'Enviar CV por email',
    proximo_passo: 'Follow-up sobre CV enviado',
    proximo_passo_data: diasAtras(2),
    created_at: diasAtras(7),
  },
]

export const MOCK_NARRATIVA: Narrativa = {
  id: 'n1', user_id: 'u1',
  posicionamento: 'COO / CRO — operações com forte componente de execução',
  narrativa_saida: 'Mudança societária que levou naturalmente a uma reconfiguração do C-level, com a saída do CEO inclusive também.',
  contextos: ['Crescimento com pressão', 'Turnaround', 'Private equity', 'IPO'],
  setores: ['Telecom', 'Tech', 'Mídia', 'Adjacentes'],
  frases_aprovadas: [
    'Decidi focar em operações com forte componente de execução, em situações de crescimento com pressão ou turnaround.',
    'Estou começando a olhar o mercado de forma estruturada, após um ciclo bem relevante de crescimento e expansão.',
    'Meu foco é C-level ou liderança de BU/P&L em Telecom, Tech e setores adjacentes.',
  ],
  versao: 3,
  updated_at: diasAtras(6),
}

export const MOCK_DASHBOARD: DashboardData = {
  followups_vencidos: MOCK_CONTATOS.filter(c => c.followup_vencido),
  reunioes_proximas: [
    {
      ...MOCK_REUNIOES[0],
      data: diasFrente(5),
      contato: { id: 'c1', nome: 'Leandro Pedrosa', empresa_nome: 'Spencer Stuart' },
    }
  ],
  contatos_frios: MOCK_CONTATOS.filter(c => c.calor === 'frio').slice(0, 3),
  metricas: {
    contatos_ativos: MOCK_CONTATOS.filter(c => !c.arquivado).length,
    reunioes_semana: 3,
    followups_pendentes: MOCK_CONTATOS.filter(c => c.followup_vencido).length,
    dias_em_processo: 63,
  }
}
