export enum TransactionType {
  EXPENSE = 'expense',
  INCOME = 'income',
  SAVING = 'saving',
  LENDING = 'lending'
}

export enum PaymentMethod {
  CASH = 'Efectivo',
  CREDIT_CARD = 'Tarjeta de Crédito',
  DEBIT_CARD = 'Tarjeta de Débito',
  TRANSFER = 'Transferencia',
  OTHER = 'Otro'
}

export enum SavingType {
  SAVING = 'Ahorro',
  INVESTMENT = 'Inversión'
}

export enum LoanFrequency {
  MONTHLY = 'Mensual',
  QUARTERLY = 'Trimestral',
  SEMIANNUAL = 'Semestral',
  ANNUAL = 'Anual'
}

export type ThemeColor = 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'pink' | 'black';

export type AutoCleaningFrequency = 'monthly' | 'quarterly' | 'yearly';

export interface AutoCleaningConfig {
  enabled: boolean;
  frequency: AutoCleaningFrequency;
  lastRun: number;
  targets: TransactionType[];
}

export interface Loan {
  id: string;
  borrowerName: string;
  borrowerId: string;
  borrowerPhone: string;
  principalAmount: number; // Monto prestado
  interestRate: number; // Porcentaje
  frequency: LoanFrequency;
  termMonths: number;
  installmentAmount: number; // Cuota calculada
  startDate: string;
  totalToPay: number; // Capital + Interés total
  amountPaid: number; // Lo que han pagado hasta ahora
  status: 'active' | 'paid' | 'default';
  transactionId: string; // ID de la transacción de salida de dinero
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO String
  description?: string;
  
  // Specific to Expense
  category?: string;
  paymentMethod?: PaymentMethod;

  // Specific to Income
  source?: string;
  relatedLoanId?: string; // Para vincular pagos a un crédito

  // Specific to Saving
  savingType?: SavingType;
  goal?: string;
  
  // Specific to Lending
  loanId?: string; // ID del objeto Loan creado

  timestamp: number;
}

export interface SummaryStats {
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  netBalance: number;
}

export interface UserProfile {
  name: string;
  age: string;
  occupation: string;
  idNumber: string;
  pin: string; // 4 digits
  avatar?: string; // Base64 image data
  biometricsEnabled: boolean;
  keepSessionOpen: boolean;
  country: string; // 'CO', 'US', 'MX', etc.
  themeColor: ThemeColor;
  autoCleaning?: AutoCleaningConfig;
}