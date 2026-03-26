// Shared Microsoft Graph API helpers for Vercel serverless functions

const TENANT_ID = process.env.TENANT_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// Lucas Faraco OneDrive — drive que contém os arquivos
export const DRIVE_ID = 'b!hmk-og7eRE-ulAe9WjQqNjk9Ulb30eFKkhiHdhkh6StpmGPeRO9BR7-aRVIJv110';
export const CRM_ITEM_ID = '01OCWLXKFUI3W2JB3WIBBJA6ILKYLKGJET';       // Base Comercial Dash.xlsx
export const PARCERIAS_ITEM_ID = '01OCWLXKDAPCMN7ECUVZEJXXTXAO3FW2T6'; // Base Parceria.xlsx

export async function getGraphToken() {
  const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: (process.env.REFRESH_TOKEN || '').replace(/\s+/g, ''),
    scope: 'Files.Read offline_access',
  });
  const res = await fetch(url, { method: 'POST', body });
  const json = await res.json();
  if (!json.access_token) throw new Error(`Token error: ${JSON.stringify(json)}`);
  return json.access_token;
}

export async function readSheet(token, driveId, itemId, sheet = 'Planilha1') {
  const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets/${encodeURIComponent(sheet)}/usedRange`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();
  if (!json.values) throw new Error(`Sheet read error: ${JSON.stringify(json)}`);
  return json.values; // [[headers...], [row1...], [row2...], ...]
}

// Converte data serial do Excel (número) para string ISO yyyy-MM-dd
export function excelDate(val) {
  if (!val) return '';
  if (typeof val === 'string' && val.includes('-')) return val.slice(0, 10);
  if (typeof val === 'string' && val.includes('/')) {
    // dd/MM/yyyy → yyyy-MM-dd
    const [d, m, y] = val.split('/');
    return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
  if (typeof val === 'number') {
    const date = new Date((val - 25569) * 86400 * 1000);
    return date.toISOString().slice(0, 10);
  }
  return String(val);
}

// Normaliza string para comparação de colunas
export function norm(s) {
  return String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}
