# CLAUDE.md — Rumo Brasil Dashboard

## Contexto do projeto
Dashboard React para área comercial da Rumo Brasil.
Atualmente dados estão inline no código (RAW e PARCERIAS_RAW).
Evolução planejada: migrar para Microsoft Graph API (SharePoint/Excel) e ClickUp API.

## Estrutura de dados atual
- RAW: array CRM com índices definidos em F{}
- PARCERIAS_RAW: array parcerias com índices em P{}
- Total referência: 1.338 empresas (439 PME / 899 ETP)
- ATENÇÃO: "faturamento" = receita declarada, NÃO valor contratado
- Algumas PME têm receita de grupo maior não capturada no faturamento declarado

## Time comercial
- Executivos externos: Sandro Casagrande, Carla Cristina Lemes, Isaac Santos, Marco
- SDR: Fabiana
- Inside Sales: Tatiane
- Gestor: Rafael

## Abas do dashboard
- acomp → Executivos Externos (Sandro, Carla, Isaac, Marco)
- interno → Executivos Internos / Inside Sales (Tatiane)
- sdr → SDR (Fabiana)
- diag → Diagnóstico
- parcerias → Parcerias

## Esquema de dados — RAW (CRM)
Índices via F{}:
- F.ID=0, F.NOME=1, F.RESP=2, F.ETAPA=3, F.ESTADO=4
- F.PERFIL=5, F.MOTIVO=6, F.DPRIMEIRO=7
- F.DREUNIAO=8, F.SOLDOC=9, F.DFECH=10

Etapas em ordem: Entrada → Follow-up Inicial → Reuniao Agendada →
Reuniao Realizada → Raio-X → Diagnostico → Solicitacao de Documentos →
Apresentacao → Proposta → Negociacao → Fechamento

Status possíveis: Em Andamento | Perdida | Vendida

## Esquema de dados — PARCERIAS_RAW
Índices via P{}:
- P.ID=0, P.EMPRESA=1, P.PARCEIRO=2, P.STATUS=3, P.ETAPA=4
- P.MOTIVO=5, P.FONTE=6, P.RESP=7, P.PAIS=8, P.UF=9
- P.MESO=10, P.PERFIL=11, P.REUNIAO=12, P.DECISOR=13
- P.FROTA=14, P.DATA_IND=15, P.DATA_REUN=16
- P.CONTRATO=17, P.ANO=18, P.MES=19

## Metas por executivo (EXEC_METAS)
- Sandro: 10 visitas/mês, 110 visitas/ano, 11 contratos
- Carla: 10 visitas/mês, 110 visitas/ano, 11 contratos
- Isaac: 5 visitas/mês, 85 visitas/ano, 9 contratos
- Marco: 5 visitas/mês, 85 visitas/ano, 9 contratos
- Meta global: 25 visitas/dia, 20 agendamentos/mês

## Padrão visual
- Accent: #FF8200 (laranja Rumo)
- Header: #1A1A1C (dark)
- Fundo geral: #ECEDEC
- Fonte: Noto Sans
- Lib de gráficos: Recharts
- Cores dos executivos: Sandro=#FF8200, Carla=#1565C0, Isaac=#2E7D32, Marco=#6F7072

## Parceiros mapeados
FB Consult=#FF8200, 4DGroup=#4A4B4D, Saionara | Raster GR=#8C5200,
Anderson FF=#A0A0A0, Daniel | Raster=#6F7072, Eusimar | Raster=#333333,
Sem parceiro=#C0C0C0

## Filtros globais
- dateIni / dateFim → filtro por intervalo de datas
- selPerfil → Todos | ETP | PME
- Lógica: inRange() checa DPRIMEIRO, DREUNIAO e DFECH

## Regras de código
- Manter padrão de índices F{} e P{} para acesso aos arrays
- Nunca hardcodar dados fora dos arrays RAW/PARCERIAS_RAW
- Filtros globais sempre via FL (useMemo sobre RAW)
- Valores monetários: Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'})
- Nunca commitar .env.local quando APIs forem integradas
- Variáveis de ambiente via import.meta.env.VITE_*
