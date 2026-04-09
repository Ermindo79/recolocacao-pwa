import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useContato, useReunioes } from '../hooks'
import { useNarrativaStore } from '../stores/narrativa.store'
import { TopBar } from '../components/layout'
import { Avatar, Skeleton, ErrorState } from '../components/ui'
import { clsx, formatarData, tempoAtras } from '../utils'

const TOM_COLOR: Record<string, string> = {
  muito_positivo: 'text-[#1A6B45]',
  aberto: 'text-accent',
  neutro: 'text-ink-3',
  frio: 'text-[#C0392B]',
}

const TOM_LABEL: Record<string, string> = {
  muito_positivo: 'Muito positivo',
  aberto: 'Aberto',
  neutro: 'Neutro',
  frio: 'Frio',
}

const FORMATO_LABEL: Record<string, string> = {
  ligacao: 'Ligação', cafe: 'Café', video: 'Vídeo',
  mensagem: 'Mensagem', presencial: 'Presencial',
}

export default function ReuniaoPrepPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: contato, isLoading, error } = useContato(id ?? '')
  const { data: reunioes = [] } = useReunioes(id ?? '')
  const { narrativa } = useNarrativaStore()

  const ultimaReuniao = reunioes[0]
  const pendencias = ultimaReuniao?.pendencias
  const isFirstMeeting = reunioes.length === 0

  if (isLoading) return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto">
      <TopBar back onBack={() => navigate(-1)} title="Prep pré-reunião" />
      <div className="px-4 py-4 space-y-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    </div>
  )

  if (error || !contato) return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto">
      <TopBar back onBack={() => navigate(-1)} title="Prep pré-reunião" />
      <ErrorState message="Contato não encontrado." onRetry={() => navigate(-1)} />
    </div>
  )

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-white overflow-hidden">
      <TopBar
        back onBack={() => navigate(-1)}
        title="Prep pré-reunião"
        right={
          <button
            onClick={async () => {
              const texto = gerarTextoPrep(contato, ultimaReuniao, narrativa)
              await navigator.clipboard.writeText(texto)
            }}
            className="text-[12px] font-medium text-accent px-3 py-1.5 bg-accent-lt rounded-lg"
          >
            Copiar
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto bg-surface px-4 py-4 space-y-3 pb-24">

        {/* Header do contato */}
        <div className="bg-white border border-[rgba(26,26,24,0.10)] rounded-xl px-4 py-3 flex items-center gap-3">
          <Avatar nome={contato.nome} size="lg" />
          <div>
            <p className="text-[16px] font-medium text-ink">{contato.nome}</p>
            <p className="text-[12px] text-ink-3">{contato.cargo} · {contato.empresa_nome}</p>
            {contato.ponte_contato && (
              <p className="text-[11px] text-ink-4 mt-0.5">Indicado por {contato.ponte_contato.nome}</p>
            )}
          </div>
        </div>

        {/* Primeiro encontro */}
        {isFirstMeeting && (
          <PrepBlock
            label="Primeiro encontro"
            color="blue"
            content={
              <p className="text-[13px] text-ink-2 leading-relaxed">
                Este é o primeiro contato registrado com {contato.nome.split(' ')[0]}.
                {contato.ponte_contato && ` Foi indicado por ${contato.ponte_contato.nome}.`}
                {contato.notas && ` ${contato.notas}`}
              </p>
            }
          />
        )}

        {/* Última interação */}
        {ultimaReuniao && (
          <PrepBlock
            label="Última interação"
            color="teal"
            content={
              <div>
                <p className="text-[12px] font-medium text-ink mb-1">
                  {ultimaReuniao.formato ? FORMATO_LABEL[ultimaReuniao.formato] : 'Reunião'}
                  {ultimaReuniao.tom && (
                    <span className={clsx('ml-2 font-normal', TOM_COLOR[ultimaReuniao.tom])}>
                      · {TOM_LABEL[ultimaReuniao.tom]}
                    </span>
                  )}
                  <span className="text-ink-4 font-normal ml-2">· {formatarData(ultimaReuniao.data)}</span>
                </p>
                {ultimaReuniao.conteudo && (
                  <p className="text-[13px] text-ink-2 leading-relaxed">{ultimaReuniao.conteudo}</p>
                )}
              </div>
            }
          />
        )}

        {/* Pendências */}
        {pendencias && (
          <PrepBlock
            label="Pendências em aberto"
            color="amber"
            content={<p className="text-[13px] text-ink-2 leading-relaxed">{pendencias}</p>}
          />
        )}

        {/* Pontos a cobrir */}
        <PrepBlock
          label="Pontos a cobrir"
          color="blue"
          content={
            <div className="space-y-2">
              {contato.proximo_passo && (
                <p className="text-[13px] text-ink-2">→ Confirmar: {contato.proximo_passo}</p>
              )}
              {pendencias && (
                <p className="text-[13px] text-ink-2">→ Resolver pendência: {pendencias}</p>
              )}
              <p className="text-[13px] text-ink-2">→ Perguntar sobre oportunidades no setor</p>
              <p className="text-[13px] text-ink-2">→ Compartilhar posicionamento se perguntado</p>
            </div>
          }
        />

        {/* Narrativa */}
        {narrativa && (
          <PrepBlock
            label="Narrativa oficial"
            color="purple"
            content={
              <div className="space-y-2">
                {narrativa.posicionamento && (
                  <p className="text-[12px] font-medium text-ink">{narrativa.posicionamento}</p>
                )}
                {narrativa.narrativa_saida && (
                  <p className="text-[13px] text-ink-2 leading-relaxed italic">"{narrativa.narrativa_saida}"</p>
                )}
              </div>
            }
          />
        )}

        {/* Atenção */}
        {contato.notas && (
          <PrepBlock
            label="Atenção"
            color="coral"
            content={<p className="text-[13px] text-ink-2 leading-relaxed">{contato.notas}</p>}
          />
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-white border-t border-[rgba(26,26,24,0.08)] pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={() => navigate(`/reuniao/nova?contato=${contato.id}`)}
          className="w-full bg-accent text-white rounded-xl py-3 text-[14px] font-medium active:opacity-80"
        >
          Registrar reunião
        </button>
      </div>
    </div>
  )
}

function PrepBlock({ label, color, content }: {
  label: string
  color: 'blue' | 'teal' | 'amber' | 'purple' | 'coral'
  content: React.ReactNode
}) {
  const colors = {
    blue:   'bg-accent-lt border-[rgba(28,61,90,0.12)]',
    teal:   'bg-[#E1F5EE] border-[rgba(15,110,86,0.15)]',
    amber:  'bg-[#FDF5E6] border-[rgba(154,107,26,0.2)]',
    purple: 'bg-[#EEEDFE] border-[rgba(83,74,183,0.15)]',
    coral:  'bg-[#FAECE7] border-[rgba(153,60,29,0.15)]',
  }
  const labelColors = {
    blue:   'text-accent',
    teal:   'text-[#0F6E56]',
    amber:  'text-[#9A6B1A]',
    purple: 'text-[#3C3489]',
    coral:  'text-[#993C1D]',
  }
  return (
    <div className={clsx('rounded-xl px-3.5 py-3 border', colors[color])}>
      <p className={clsx('text-[10px] font-medium uppercase tracking-[0.08em] mb-2', labelColors[color])}>
        {label}
      </p>
      {content}
    </div>
  )
}

function gerarTextoPrep(contato: any, ultimaReuniao: any, narrativa: any): string {
  const linhas = [`PREP — ${contato.nome} (${contato.empresa_nome})\n`]
  if (ultimaReuniao) {
    linhas.push(`Última interação: ${formatarData(ultimaReuniao.data)}`)
    if (ultimaReuniao.conteudo) linhas.push(ultimaReuniao.conteudo)
  }
  if (narrativa?.narrativa_saida) {
    linhas.push(`\nNarrativa: "${narrativa.narrativa_saida}"`)
  }
  if (contato.notas) linhas.push(`\nAtenção: ${contato.notas}`)
  return linhas.join('\n')
}
