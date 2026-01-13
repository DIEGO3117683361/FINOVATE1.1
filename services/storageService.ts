import { Transaction, Loan, TransactionType, UserProfile } from '../types';

const STORAGE_KEY = 'finanzas_ios_db_v1';
const LOANS_KEY = 'finanzas_ios_loans_v1';

// --- Transactions ---

export const getTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading data", error);
    return [];
  }
};

export const saveTransaction = (transaction: Transaction): void => {
  const current = getTransactions();
  const updated = [transaction, ...current]; // Newest first
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const deleteTransaction = (id: string): void => {
  const current = getTransactions();
  const updated = current.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const updateTransaction = (updatedTx: Transaction): void => {
  const current = getTransactions();
  const index = current.findIndex(t => t.id === updatedTx.id);
  if (index !== -1) {
    current[index] = updatedTx;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }
};

// --- Loans ---

export const getLoans = (): Loan[] => {
  try {
    const data = localStorage.getItem(LOANS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading loans", error);
    return [];
  }
};

export const saveLoan = (loan: Loan): void => {
  const current = getLoans();
  const updated = [loan, ...current];
  localStorage.setItem(LOANS_KEY, JSON.stringify(updated));
};

export const updateLoanPayment = (loanId: string, amount: number): void => {
  const loans = getLoans();
  const index = loans.findIndex(l => l.id === loanId);
  if (index !== -1) {
    loans[index].amountPaid += amount;
    if (loans[index].amountPaid >= loans[index].totalToPay - 1) { // Tolerance for small decimals
      loans[index].status = 'paid';
    }
    localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
  }
};

// --- Data Management & Cleaning ---

export const clearAllFinancialData = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LOANS_KEY);
};

export const clearFinancialDataByTypes = (types: TransactionType[]) => {
  // Clear Transactions
  const currentTxs = getTransactions();
  const keptTxs = currentTxs.filter(t => !types.includes(t.type));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keptTxs));

  // Clear Loans if LENDING is selected
  if (types.includes(TransactionType.LENDING)) {
    localStorage.removeItem(LOANS_KEY);
  }
};

export const checkAndPerformAutoCleaning = (profile: UserProfile): boolean => {
  if (!profile.autoCleaning?.enabled) return false;

  const { frequency, lastRun, targets } = profile.autoCleaning;
  const now = Date.now();
  let shouldRun = false;

  const msInDay = 86400000;
  
  if (frequency === 'monthly' && (now - lastRun > msInDay * 30)) {
    shouldRun = true;
  } else if (frequency === 'quarterly' && (now - lastRun > msInDay * 90)) {
    shouldRun = true;
  } else if (frequency === 'yearly' && (now - lastRun > msInDay * 365)) {
    shouldRun = true;
  }

  if (shouldRun) {
    console.log("Running Auto Cleaning for types:", targets);
    clearFinancialDataByTypes(targets);
    return true;
  }

  return false;
};