// GET /api/crm → retorna RAW no formato array-de-arrays (índices F{})
import { getGraphToken, readSheet, DRIVE_ID, CRM_ITEM_ID, excelDate, norm } from './_graph.js';

// Mapeamento: nome normalizado da coluna → índice F{}
const F = { ID:0, NOME:1, RESP:2, ETAPA:3, ESTADO:4, PERFIL:5, MOTIVO:6, DPRIMEIRO:7, DREUNIAO:8, SOLDOC:9, DFECH:10 };

// Cabeçalhos exatos da planilha (normalizados = lowercase + sem acentos)
// Nome | Perfil | Empresa | Etapa | Estado | Motivo de Perda | Data do primeiro contato |
// Data do Ultimo contato | Data de fechamento | Fonte | Responsável: | Indicado por: |
// Solicitação de Documentos: | Reunião com o decisor? | Quant. Frota: | Quant. Funcionários |
// Mesoregião | Evento | Data da Reunião Realizada | Tipo de reunião: | SDR: | Parcerias:
const COL_MAP = {
  'empresa': F.NOME, 'nome': F.NOME,
  'responsavel:': F.RESP, 'responsavel': F.RESP,
  'etapa': F.ETAPA,
  'estado': F.ESTADO, 'status': F.ESTADO,
  'perfil': F.PERFIL,
  'motivo de perda': F.MOTIVO,
  'data do primeiro contato': F.DPRIMEIRO,
  'data da reuniao realizada': F.DREUNIAO, 'data do ultimo contato': F.DREUNIAO,
  'solicitacao de documentos:': F.SOLDOC, 'solicitacao de documentos': F.SOLDOC,
  'data de fechamento': F.DFECH,
};

const DATE_COLS = new Set([F.DPRIMEIRO, F.DREUNIAO, F.DFECH]);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300'); // cache 5 min na Vercel

  try {
    const token = await getGraphToken();
    const values = await readSheet(token, DRIVE_ID, CRM_ITEM_ID);

    const headers = values[0].map(norm);
    const dataRows = values.slice(1).filter(row => row.some(c => c !== '' && c !== null));

    // Descobrir qual coluna do Excel mapeia para cada índice F{}
    const colIdx = {}; // F_index → excel_col_index
    headers.forEach((h, i) => {
      const fIdx = COL_MAP[h];
      if (fIdx !== undefined && colIdx[fIdx] === undefined) colIdx[fIdx] = i;
    });

    const raw = dataRows.map((row, i) => {
      const get = (fIdx) => {
        const ci = colIdx[fIdx];
        const val = ci !== undefined ? (row[ci] ?? '') : '';
        return DATE_COLS.has(fIdx) ? excelDate(val) : String(val);
      };

      // F.ID: usa coluna ID se existir, senão usa número sequencial
      const id = colIdx[F.ID] !== undefined ? Number(row[colIdx[F.ID]]) || i + 1 : i + 1;

      return [
        id,          // F.ID
        get(F.NOME), // F.NOME
        get(F.RESP), // F.RESP
        get(F.ETAPA),// F.ETAPA
        get(F.ESTADO),// F.ESTADO
        get(F.PERFIL),// F.PERFIL
        get(F.MOTIVO),// F.MOTIVO
        get(F.DPRIMEIRO), // F.DPRIMEIRO
        get(F.DREUNIAO),  // F.DREUNIAO
        get(F.SOLDOC),    // F.SOLDOC
        get(F.DFECH),     // F.DFECH
      ];
    });

    res.status(200).json(raw);
  } catch (err) {
    console.error('CRM API error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
