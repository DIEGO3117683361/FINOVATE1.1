export const EXPENSE_CATEGORIES = [
  'Alimentación',
  'Transporte',
  'Vivienda',
  'Servicios',
  'Salud',
  'Educación',
  'Entretenimiento',
  'Ropa',
  'Tecnología',
  'Préstamo Otorgado',
  'Otros'
];

export const INCOME_SOURCES = [
  'Salario',
  'Freelance',
  'Inversiones',
  'Regalo',
  'Venta',
  'Cobro de Cuota',
  'Liquidación Crédito',
  'Otros'
];

export const LOAN_INTEREST_RATES = [4, 5, 8, 10];

export const THEME_COLORS = {
  blue: { name: 'Apple Blue', class: 'blue', hex: '#007AFF' },
  green: { name: 'Success Green', class: 'emerald', hex: '#34C759' },
  yellow: { name: 'Sunshine', class: 'amber', hex: '#FFCC00' },
  orange: { name: 'Safety Orange', class: 'orange', hex: '#FF9500' },
  red: { name: 'System Red', class: 'rose', hex: '#FF3B30' },
  pink: { name: 'Flamingo', class: 'pink', hex: '#FF2D55' },
  black: { name: 'Midnight', class: 'slate', hex: '#000000' },
};

// Aesthetic Colors for Charts (Updated for iOS feel)
export const CHART_COLORS = [
  '#007AFF', // Blue
  '#FF2D55', // Pink
  '#34C759', // Green
  '#FF9500', // Orange
  '#5856D6', // Purple
  '#5AC8FA', // Teal
  '#FFCC00', // Yellow
  '#AF52DE'  // Indigo
];

export const COUNTRIES: Record<string, { name: string, locale: string, currency: string }> = {
  'CO': { name: 'Colombia', locale: 'es-CO', currency: 'COP' },
  'MX': { name: 'México', locale: 'es-MX', currency: 'MXN' },
  'US': { name: 'Estados Unidos', locale: 'en-US', currency: 'USD' },
  'ES': { name: 'España', locale: 'es-ES', currency: 'EUR' },
  'EC': { name: 'Ecuador', locale: 'es-EC', currency: 'USD' },
  'CL': { name: 'Chile', locale: 'es-CL', currency: 'CLP' },
  'PE': { name: 'Perú', locale: 'es-PE', currency: 'PEN' },
};

export const formatMoney = (amount: number, countryCode: string = 'CO') => {
  const config = COUNTRIES[countryCode] || COUNTRIES['CO'];
  return new Intl.NumberFormat(config.locale, { 
    style: 'currency', 
    currency: config.currency,
    minimumFractionDigits: 0, 
    maximumFractionDigits: 2 
  }).format(amount);
};