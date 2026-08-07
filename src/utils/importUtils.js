import * as XLSX from 'xlsx';

export function normalizeHeaderKey(header) {
  return String(header)
    .toLowerCase()
    .trim()
    .replace(/[₹$()]/g, '')
    .replace(/[^\w\s/]/g, ' ')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function parseImportDate(value) {
  if (value === null || value === undefined || value === '') return undefined;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().split('T')[0];
  }

  if (typeof value === 'number' && value > 0) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
    }
  }

  const text = String(value).trim();
  if (!text || text === '-') return undefined;

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsedDate = new Date(text);
  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString().split('T')[0];
  }

  return text;
}

function parseImportTime(value) {
  if (value === null || value === undefined || value === '') return undefined;

  if (typeof value === 'number' && value >= 0 && value < 1) {
    const totalMinutes = Math.round(value * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  const text = String(value).trim();
  if (!text || text === '-') return undefined;

  const match = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[3]?.toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  return text;
}

function parseImportAmount(value) {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value === 'number') return value;

  const text = String(value).trim();
  if (!text || text === '-') return undefined;

  const cleaned = text.replace(/[₹,\s]/g, '');
  const amount = parseFloat(cleaned);
  return Number.isNaN(amount) ? text : amount;
}

export function sanitizeImportValue(value, fieldKey) {
  if (value === null || value === undefined) return undefined;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '' || trimmed === '-') return undefined;
  }

  const dateFields = new Set(['function_date', 'booking_date', 'date']);
  const timeFields = new Set(['function_time']);
  const amountFields = new Set(['total_amount', 'advance_amount', 'balance_amount', 'amount']);

  if (dateFields.has(fieldKey)) return parseImportDate(value);
  if (timeFields.has(fieldKey)) return parseImportTime(value);
  if (amountFields.has(fieldKey)) return parseImportAmount(value);

  return typeof value === 'string' ? value.trim() : value;
}

export function mapImportRows(jsonData, { defaults, aliases, requiredFields = [] }) {
  return jsonData
    .map((row) => {
      const mapped = { ...defaults };

      Object.entries(row).forEach(([header, rawValue]) => {
        const normalizedKey = normalizeHeaderKey(header);
        let fieldKey = aliases[normalizedKey] || normalizedKey;

        if (normalizedKey.includes('s/o') || normalizedKey.includes('son_of')) {
          fieldKey = 'bridegroom_so';
        } else if (normalizedKey.includes('d/o') || normalizedKey.includes('daughter_of')) {
          fieldKey = 'bride_do';
        }

        const sanitized = sanitizeImportValue(rawValue, fieldKey);

        if (sanitized !== undefined) {
          mapped[fieldKey] = sanitized;
        }
      });

      return mapped;
    })
    .filter((row) =>
      requiredFields.some((key) => {
        const value = row[key];
        return value !== null && value !== undefined && String(value).trim() !== '';
      })
    );
}

export const BOOKING_FIELD_ALIASES = {
  customer: 'user_name',
  user_name: 'user_name',
  name: 'user_name',
  client: 'user_name',
  hall_type: 'hall_type',
  hall: 'hall_type',
  type: 'function_type',
  function_type: 'function_type',
  event_type: 'function_type',
  function_date: 'function_date',
  date: 'function_date',
  booking_date: 'booking_date',
  function_time: 'function_time',
  time: 'function_time',
  total_amount: 'total_amount',
  total: 'total_amount',
  amount: 'total_amount',
  advance_amount: 'advance_amount',
  advance: 'advance_amount',
  balance_amount: 'balance_amount',
  balance: 'balance_amount',
  guests: 'guests',
  address: 'address',
  phone: 'phone',
  mobile: 'phone',
  user_email: 'user_email',
  email: 'user_email',
  status: 'status',
};

export const BILLING_FIELD_ALIASES = {
  booking_ref: 'booking_id',
  booking_id: 'booking_id',
  booking_name: 'booking_name',
  booking: 'booking_name',
  amount: 'amount',
  date: 'date',
  status: 'status',
};

export const CERTIFICATE_FIELD_ALIASES = {
  receipt_no: 'receipt_no',
  receipt: 'receipt_no',
  receipt_number: 'receipt_no',
  bridegroom: 'bridegroom',
  bride: 'bride',
  bridegroom_so: 'bridegroom_so',
  bride_do: 'bride_do',
  requestor_name: 'requestor_name',
  function_date: 'function_date',
  booking_date: 'booking_date',
  function_time: 'function_time',
  time: 'function_time',
};
