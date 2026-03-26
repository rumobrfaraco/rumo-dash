// GET /api/parcerias → retorna PARCERIAS_RAW no formato array-de-arrays (índices P{})
import { getGraphToken, readSheet, DRIVE_ID, PARCERIAS_ITEM_ID, excelDate, norm } from './_graph.js';

// Mapeamento: nome normalizado da coluna → índice P{}
const P = { ID:0, EMPRESA:1, PARCEIRO:2, STATUS:3, ETAPA:4, MOTIVO:5, FONTE:6, RESP:7, PAIS:8, UF:9, MESO:10, PERFIL:11, REUNIAO:12, DECISOR:13, FROTA:14, DATA_IND:15, DATA_REUN:16, CONTRATO:17, ANO:18, MES:19 };

// Cabeçalhos exatos da planilha (normalizados):
// id_lead | empresa | parceiro | status | etapa | motivo_perda | fonte | responsavel |
// pais | uf | mesoregiao | perfil_empresa | reuniao_realizada | reuniao_decisor |
// quant_frota | data_indicacao | data_reuniao | contrato_fechado | ano | mes
const COL_MAP = {
  'id_lead': P.ID, 'id': P.ID,
  'empresa': P.EMPRESA,
  'parceiro': P.PARCEIRO,
  'status': P.STATUS,
  'etapa': P.ETAPA,
  'motivo_perda': P.MOTIVO, 'motivo de perda': P.MOTIVO,
  'fonte': P.FONTE,
  'responsavel': P.RESP,
  'pais': P.PAIS,
  'uf': P.UF,
  'mesoregiao': P.MESO,
  'perfil_empresa': P.PERFIL, 'perfil de empresa': P.PERFIL,
  'reuniao_realizada': P.REUNIAO,
  'reuniao_decisor': P.DECISOR,
  'quant_frota': P.FROTA,
  'data_indicacao': P.DATA_IND,
  'data_reuniao': P.DATA_REUN,
  'contrato_fechado': P.CONTRATO,
  'ano': P.ANO,
  'mes': P.MES, 'mês': P.MES,
};

const DATE_COLS = new Set([P.DATA_IND, P.DATA_REUN]);

// Lista todas as abas disponíveis no arquivo
async function listSheets(token, driveId, itemId) {
  const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();
  return (json.value || []).map(s => s.name);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300');

  try {
    const token = await getGraphToken();

    // Auto-detectar o nome da aba
    const sheets = await listSheets(token, DRIVE_ID, PARCERIAS_ITEM_ID);
    const sheetName = sheets[0] || 'Planilha1';

    const values = await readSheet(token, DRIVE_ID, PARCERIAS_ITEM_ID, sheetName);

    if (req.query?.debug === '1') {
      return res.json({ sheets, sheetName, first5rows: values.slice(0, 5) });
    }

    // Pula linhas de instrução (ex: Power BI header) e encontra a linha real de cabeçalhos
    const headerRowIdx = values.findIndex(row =>
      row.some(c => typeof c === 'string' && /empresa|id_lead/i.test(c))
    );
    if (headerRowIdx === -1) throw new Error('Header row not found');

    const headers = values[headerRowIdx].map(norm);
    const dataRows = values.slice(headerRowIdx + 1).filter(row => row.some(c => c !== '' && c !== null));

    const colIdx = {};
    headers.forEach((h, i) => {
      const pIdx = COL_MAP[h];
      if (pIdx !== undefined && colIdx[pIdx] === undefined) colIdx[pIdx] = i;
    });

    const raw = dataRows.map((row, i) => {
      const get = (pIdx) => {
        const ci = colIdx[pIdx];
        const val = ci !== undefined ? (row[ci] ?? '') : '';
        if (DATE_COLS.has(pIdx)) return excelDate(val);
        if (pIdx === P.ANO || pIdx === P.MES) return Number(val) || 0;
        return String(val);
      };

      const id = colIdx[P.ID] !== undefined ? Number(row[colIdx[P.ID]]) || i + 1 : i + 1;

      return [
        id,             // P.ID
        get(P.EMPRESA), // P.EMPRESA
        get(P.PARCEIRO),// P.PARCEIRO
        get(P.STATUS),  // P.STATUS
        get(P.ETAPA),   // P.ETAPA
        get(P.MOTIVO),  // P.MOTIVO
        get(P.FONTE),   // P.FONTE
        get(P.RESP),    // P.RESP
        get(P.PAIS),    // P.PAIS
        get(P.UF),      // P.UF
        get(P.MESO),    // P.MESO
        get(P.PERFIL),  // P.PERFIL
        get(P.REUNIAO), // P.REUNIAO
        get(P.DECISOR), // P.DECISOR
        get(P.FROTA),   // P.FROTA
        get(P.DATA_IND),// P.DATA_IND
        get(P.DATA_REUN),// P.DATA_REUN
        get(P.CONTRATO),// P.CONTRATO
        get(P.ANO),     // P.ANO
        get(P.MES),     // P.MES
      ];
    });

    res.status(200).json(raw);
  } catch (err) {
    console.error('Parcerias API error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
