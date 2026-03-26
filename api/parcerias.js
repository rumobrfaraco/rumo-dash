// GET /api/parcerias → retorna PARCERIAS_RAW no formato array-de-arrays (índices P{})
import { getGraphToken, readSheet, DRIVE_ID, PARCERIAS_ITEM_ID, excelDate, norm } from './_graph.js';

// Mapeamento: nome normalizado da coluna → índice P{}
const P = { ID:0, EMPRESA:1, PARCEIRO:2, STATUS:3, ETAPA:4, MOTIVO:5, FONTE:6, RESP:7, PAIS:8, UF:9, MESO:10, PERFIL:11, REUNIAO:12, DECISOR:13, FROTA:14, DATA_IND:15, DATA_REUN:16, CONTRATO:17, ANO:18, MES:19 };

const COL_MAP = {
  'id': P.ID,
  'empresa': P.EMPRESA, 'nome': P.EMPRESA,
  'parceiro': P.PARCEIRO, 'indicado por': P.PARCEIRO,
  'status': P.STATUS,
  'etapa': P.ETAPA,
  'motivo de perda': P.MOTIVO, 'motivo': P.MOTIVO,
  'fonte': P.FONTE,
  'responsavel': P.RESP, 'resp': P.RESP,
  'pais': P.PAIS, 'país': P.PAIS,
  'uf': P.UF,
  'mesoregiao': P.MESO, 'meso': P.MESO, 'mesoregião': P.MESO,
  'perfil de empresa': P.PERFIL, 'perfil': P.PERFIL, 'qualificacao': P.PERFIL,
  'reuniao com decisor': P.REUNIAO, 'reunião com decisor': P.REUNIAO, 'reuniao': P.REUNIAO,
  'decisor': P.DECISOR,
  'quant. frota': P.FROTA, 'frota': P.FROTA, 'quantidade frota': P.FROTA,
  'data de indicacao': P.DATA_IND, 'data ind': P.DATA_IND, 'data_ind': P.DATA_IND,
  'data da reuniao': P.DATA_REUN, 'data reun': P.DATA_REUN, 'data_reun': P.DATA_REUN,
  'solicitacao de documentos': P.CONTRATO, 'contrato': P.CONTRATO,
  'ano': P.ANO,
  'mes': P.MES, 'mês': P.MES,
};

const DATE_COLS = new Set([P.DATA_IND, P.DATA_REUN]);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300');

  try {
    const token = await getGraphToken();
    const values = await readSheet(token, DRIVE_ID, PARCERIAS_ITEM_ID);

    const headers = values[0].map(norm);
    const dataRows = values.slice(1).filter(row => row.some(c => c !== '' && c !== null));

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
