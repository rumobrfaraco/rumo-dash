// GET /api/diagnostico → busca tarefas do ClickUp e retorna no formato DIAG_DATA
const LIST_ID = '901709896563';

// IDs dos custom fields relevantes
const CF = {
  EXEC:    '6af7e2ba-6140-4a93-b757-41353ab77a62', // Account Executive (short_text)
  TAMANHO: 'bbf9931a-e75f-40bc-84f0-adb050476711', // Tamanho: (drop_down)
  REFORMA: 'd470b897-47c3-4580-945b-3e527ffba1db', // Reforma Tributária: (drop_down)
  ESTADO:  'ef32d838-b2bf-4324-bbd9-acf98633c4e0', // Estado (drop_down)
  ENTRADA: 'c3096071-f3c4-41ae-ae28-c4d4fb6ecc9c', // Data de Entrada: (date ms)
  ENTREGA: 'e2421533-a034-49e4-ba94-8c7eb33616a6', // Data de Entrega: (date ms)
};

// Converte timestamp ms para ISO yyyy-MM-dd
function tsToIso(ms) {
  if (!ms) return null;
  return new Date(Number(ms)).toISOString().slice(0, 10);
}

// Extrai nome de um drop_down pelo orderindex
function ddVal(cf) {
  const v = cf?.value;
  if (v === null || v === undefined || v === '') return '';
  const opts = cf?.type_config?.options || [];
  const opt = opts.find(o => String(o.orderindex) === String(v));
  return opt ? opt.name : String(v);
}

// Normaliza status do ClickUp para o padrão do dashboard
function normStatus(s) {
  const clean = String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const map = {
    'complete': 'COMPLETE',
    'aguardando documentacao': 'AGUARDANDO DOCUMENTACAO',
    'revalidacao': 'REVALIDACAO',
    'apresentacao': 'APRESENTACAO',
    'em processo': 'EM PROCESSO',
    'nao iniciada': 'NAO INICIADA',
  };
  return map[clean] || s.toUpperCase();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300');

  try {
    const token = process.env.CLICKUP_API_KEY;
    if (!token) throw new Error('CLICKUP_API_KEY not set');

    const url = `https://api.clickup.com/api/v2/list/${LIST_ID}/task?include_closed=true&subtasks=false&page=0`;
    const r = await fetch(url, { headers: { Authorization: token } });
    const json = await r.json();

    if (!json.tasks) throw new Error(`ClickUp error: ${JSON.stringify(json)}`);

    const data = json.tasks.map((t, i) => {
      const cfsById = {};
      for (const cf of t.custom_fields || []) cfsById[cf.id] = cf;

      const entrada = tsToIso(cfsById[CF.ENTRADA]?.value);
      const entrega = tsToIso(cfsById[CF.ENTREGA]?.value);

      let dias = null;
      if (entrada && entrega) {
        dias = Math.round((new Date(entrega) - new Date(entrada)) / 86400000);
      }

      const exec = cfsById[CF.EXEC]?.value || t.assignees?.[0]?.username || '';

      return {
        id: i + 1,
        empresa: t.name,
        status: normStatus(t.status.status),
        executivo: exec,
        estado: ddVal(cfsById[CF.ESTADO]),
        reforma: ddVal(cfsById[CF.REFORMA]),
        tam: ddVal(cfsById[CF.TAMANHO]),
        dataInicio: entrada,
        dataConclusao: entrega,
        dias,
      };
    });

    res.status(200).json(data);
  } catch (err) {
    console.error('Diagnostico API error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
