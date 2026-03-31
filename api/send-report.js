// GET /api/send-report
// Chamado pelo Vercel Cron ou manualmente via GET ?secret=...
// Gera relatório HTML com KPIs e envia por Outlook (Microsoft Graph)
//
// Variáveis de ambiente necessárias:
//   MAIL_SENDER          — e-mail remetente (deve existir no tenant, ex: rafael@rumobrasil.com.br)
//   REPORT_RECIPIENTS    — destinatários separados por vírgula
//   CRON_SECRET          — segredo para proteger chamada manual (opcional)
//   TENANT_ID, CLIENT_ID, CLIENT_SECRET — já usados pelo _graph.js
//   CLICKUP_API_KEY      — já usado pelo diagnostico.js

import { getMailToken, sendMail } from './_graph.js';

const SENDER     = process.env.MAIL_SENDER || '';
const RECIPIENTS = (process.env.REPORT_RECIPIENTS || '').split(',').map(s => s.trim()).filter(Boolean);
const SECRET     = process.env.CRON_SECRET || '';

// ─── KPIs manuais (CRM) ──────────────────────────────────────────────────────
// Manter em sincronia com App.jsx enquanto o SharePoint não estiver atualizado.
// Atualizar esses números a cada push de dados novos.
const EXEC_SNAP = [
  { alias: 'Sandro', color: '#FF8200', reunMes: 7,  metaReunMes: 10, contrYTD: 6, contrMes: 1, metaContratos: 11 },
  { alias: 'Carla',  color: '#1565C0', reunMes: 3,  metaReunMes: 10, contrYTD: 1, contrMes: 0, metaContratos: 11 },
  { alias: 'Isaac',  color: '#2E7D32', reunMes: 0,  metaReunMes: 5,  contrYTD: 0, contrMes: 0, metaContratos: 9  },
  { alias: 'Marco',  color: '#6F7072', reunMes: 4,  metaReunMes: 5,  contrYTD: 0, contrMes: 0, metaContratos: 9  },
];
const SDR_SNAP = { agendamentos: 10, realizadas: 6, metaAgend: 20, totalAtiv: 0 };
const MES_LABEL = 'Mar/26';

// ─── Busca dados do ClickUp (diagnóstico) ────────────────────────────────────
async function fetchDiag() {
  try {
    const LIST_ID = '901709896563';
    const token = process.env.CLICKUP_API_KEY;
    if (!token) return { total: 0, concluidos: 0, ativos: 0, simReforma: 0 };
    const r = await fetch(
      `https://api.clickup.com/api/v2/list/${LIST_ID}/task?include_closed=true&subtasks=false&page=0`,
      { headers: { Authorization: token } }
    );
    const json = await r.json();
    const tasks = json.tasks || [];
    const total     = tasks.length;
    const concluidos = tasks.filter(t => t.status.status.toLowerCase() === 'complete').length;
    const ativos     = tasks.filter(t => !['complete'].includes(t.status.status.toLowerCase())).length;
    // Reforma Tributária: custom field d470b897-47c3-4580-945b-3e527ffba1db
    const REFORMA_CF = 'd470b897-47c3-4580-945b-3e527ffba1db';
    const simReforma = tasks.filter(t => {
      const cf = (t.custom_fields || []).find(c => c.id === REFORMA_CF);
      if (!cf || cf.value === null || cf.value === undefined) return false;
      const opts = cf.type_config?.options || [];
      const opt  = opts.find(o => String(o.orderindex) === String(cf.value));
      return opt?.name?.toLowerCase() === 'sim';
    }).length;
    return { total, concluidos, ativos, simReforma };
  } catch {
    return { total: 0, concluidos: 0, ativos: 0, simReforma: 0 };
  }
}

// ─── Geração do HTML ─────────────────────────────────────────────────────────
function pct(a, b) { return b > 0 ? Math.min(Math.round(a / b * 100), 100) : 0; }

function bar(val, max, color) {
  const p = pct(val, max);
  const ok = val >= max;
  return `<div style="height:6px;background:#EBEBEB;border-radius:4px;overflow:hidden;margin-top:4px">
    <div style="height:100%;width:${p}%;background:${ok ? '#2E7D32' : color};border-radius:4px"></div>
  </div>`;
}

function buildHtml({ execs, sdr, diag, mesLabel, geradoEm }) {
  const FONT = "'Segoe UI',system-ui,sans-serif";
  const execCards = execs.map(e => `
    <td style="width:25%;padding:8px;vertical-align:top">
      <div style="border:1px solid #E0E0E0;border-top:3px solid ${e.color};border-radius:8px;padding:14px">
        <div style="font-size:13px;font-weight:700;color:#1A1A1C;margin-bottom:10px">${e.alias}</div>
        <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px">Reuniões ${mesLabel}</div>
        <div style="font-size:18px;font-weight:700;color:${e.color}">${e.reunMes}<span style="font-size:11px;font-weight:400;color:#888"> / ${e.metaReunMes}</span></div>
        ${bar(e.reunMes, e.metaReunMes, e.color)}
        <div style="margin-top:10px;font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px">Contratos YTD</div>
        <div style="font-size:18px;font-weight:700;color:${e.contrYTD >= e.metaContratos ? '#2E7D32' : '#1A1A1C'}">${e.contrYTD}<span style="font-size:11px;font-weight:400;color:#888"> / ${e.metaContratos}</span></div>
        ${bar(e.contrYTD, e.metaContratos, e.color)}
        <div style="margin-top:8px;font-size:10px;color:#888">Contratos ${mesLabel}: <strong style="color:${e.contrMes >= 1 ? '#2E7D32' : '#1A1A1C'}">${e.contrMes}</strong></div>
      </div>
    </td>
  `).join('');

  const pctAgend = pct(sdr.agendamentos, sdr.metaAgend);
  const pctReal  = sdr.agendamentos > 0 ? Math.round(sdr.realizadas / sdr.agendamentos * 100) : 0;
  const pctConc  = diag.total > 0 ? Math.round(diag.concluidos / diag.total * 100) : 0;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dashboard Comercial — ${mesLabel}</title></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:${FONT}">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:24px 0">
<tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">

  <!-- Header -->
  <tr><td style="background:#1A1A1C;padding:20px 28px">
    <table width="100%"><tr>
      <td><span style="font-size:18px;font-weight:700;color:#fff">Rumo Brasil</span>
          <span style="display:block;font-size:11px;color:#999;margin-top:2px">Dashboard Comercial</span></td>
      <td align="right"><span style="background:#FF8200;color:#fff;font-size:12px;font-weight:700;padding:5px 14px;border-radius:20px">${mesLabel}</span></td>
    </tr></table>
  </td></tr>

  <!-- Execs -->
  <tr><td style="padding:20px 20px 8px">
    <div style="font-size:10px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:.07em;margin-bottom:12px">Executivos Externos</div>
    <table width="100%" cellpadding="0" cellspacing="0"><tr>${execCards}</tr></table>
  </td></tr>

  <!-- SDR + Diag -->
  <tr><td style="padding:8px 20px 20px">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>

      <!-- SDR -->
      <td style="width:50%;padding:8px;vertical-align:top">
        <div style="border:1px solid #E0E0E0;border-radius:8px;padding:14px">
          <div style="font-size:11px;font-weight:700;color:#1A1A1C;margin-bottom:10px">SDR — Fabiana Vaz</div>
          <table width="100%">
            <tr>
              <td style="text-align:center;padding:0 8px">
                <div style="font-size:24px;font-weight:700;color:#FF8200">${sdr.agendamentos}</div>
                <div style="font-size:9px;color:#888;text-transform:uppercase;margin-top:2px">Agendamentos</div>
                <div style="font-size:9px;color:#aaa">Meta: ${sdr.metaAgend} · ${pctAgend}%</div>
              </td>
              <td style="text-align:center;padding:0 8px">
                <div style="font-size:24px;font-weight:700;color:#2E7D32">${sdr.realizadas}</div>
                <div style="font-size:9px;color:#888;text-transform:uppercase;margin-top:2px">Realizadas</div>
                <div style="font-size:9px;color:#aaa">${pctReal}% de conv.</div>
              </td>
            </tr>
          </table>
          ${bar(sdr.agendamentos, sdr.metaAgend, '#FF8200')}
        </div>
      </td>

      <!-- Diagnóstico -->
      <td style="width:50%;padding:8px;vertical-align:top">
        <div style="border:1px solid #E0E0E0;border-radius:8px;padding:14px">
          <div style="font-size:11px;font-weight:700;color:#1A1A1C;margin-bottom:10px">Diagnóstico</div>
          <table width="100%">
            <tr>
              <td style="text-align:center;padding:0 8px">
                <div style="font-size:24px;font-weight:700;color:#FF8200">${diag.total}</div>
                <div style="font-size:9px;color:#888;text-transform:uppercase;margin-top:2px">Pipeline</div>
              </td>
              <td style="text-align:center;padding:0 8px">
                <div style="font-size:24px;font-weight:700;color:#2E7D32">${diag.concluidos}</div>
                <div style="font-size:9px;color:#888;text-transform:uppercase;margin-top:2px">Concluídos</div>
                <div style="font-size:9px;color:#aaa">${pctConc}%</div>
              </td>
              <td style="text-align:center;padding:0 8px">
                <div style="font-size:24px;font-weight:700;color:#1565C0">${diag.simReforma}</div>
                <div style="font-size:9px;color:#888;text-transform:uppercase;margin-top:2px">Ref. Trib.</div>
              </td>
            </tr>
          </table>
          ${bar(diag.concluidos, diag.total, '#FF8200')}
        </div>
      </td>

    </tr></table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#F9F9F9;padding:14px 28px;border-top:1px solid #EBEBEB">
    <span style="font-size:10px;color:#BBB">Gerado automaticamente em ${geradoEm} · Rumo Brasil Dashboard</span>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Proteção básica para chamada manual (o Vercel Cron não precisa disso)
  const secret = req.query?.secret || req.headers?.['x-cron-secret'];
  if (SECRET && secret !== SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!SENDER) return res.status(500).json({ error: 'MAIL_SENDER não configurado' });
  if (!RECIPIENTS.length) return res.status(500).json({ error: 'REPORT_RECIPIENTS não configurado' });

  try {
    const [diag, mailToken] = await Promise.all([
      fetchDiag(),
      getMailToken(),
    ]);

    const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const subject = `📊 Dashboard Comercial — ${MES_LABEL} · ${new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`;

    const html = buildHtml({
      execs: EXEC_SNAP,
      sdr: SDR_SNAP,
      diag,
      mesLabel: MES_LABEL,
      geradoEm: now,
    });

    await sendMail(mailToken, SENDER, RECIPIENTS, subject, html);

    console.log(`Relatório enviado para ${RECIPIENTS.join(', ')} em ${now}`);
    res.status(200).json({ ok: true, recipients: RECIPIENTS, geradoEm: now });
  } catch (err) {
    console.error('send-report error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
