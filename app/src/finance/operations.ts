import { HttpError } from 'wasp/server'
import type {
  GetAccounts,
  CreateAccount,
  UpdateAccount,
  DeleteAccount,
  GetCategories,
  CreateCategory,
  UpdateCategory,
  DeleteCategory,
  GetTransactions,
  CreateTransaction,
  UpdateTransaction,
  DeleteTransaction,
  GetDashboardStats,
  GetBudgets,
  CreateBudget,
  UpdateBudget,
  DeleteBudget,
  GetBudgetAlerts,
} from 'wasp/server/operations'
import type { Account, Category, Transaction, Budget } from 'wasp/entities'
import { TransactionType, AccountType } from '@prisma/client'

// ==================== ACCOUNTS ====================

export const getAccounts: GetAccounts<void, Account[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autorizado');
  }

  return context.entities.Account.findMany({
    where: { userId: context.user.id },
    orderBy: { createdAt: 'desc' },
  });
}

type CreateAccountInput = Pick<Account, 'name' | 'type' | 'initialBalance' | 'currency' | 'color' | 'icon' | 'description'>
export const createAccount: CreateAccount<CreateAccountInput, Account> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autorizado');
  }

  return context.entities.Account.create({
    data: {
      ...args,
      balance: args.initialBalance,
      userId: context.user.id,
    },
  });
}

type UpdateAccountInput = Pick<Account, 'id'> & Partial<Omit<Account, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
export const updateAccount: UpdateAccount<UpdateAccountInput, Account> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autorizado');
  }

  const account = await context.entities.Account.findUnique({
    where: { id: args.id },
  });

  if (!account || account.userId !== context.user.id) {
    throw new HttpError(404, 'Conta não encontrada');
  }

  const { id, ...updateData } = args;
  return context.entities.Account.update({
    where: { id },
    data: updateData,
  });
}

export const deleteAccount: DeleteAccount<{ id: string }, void> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autorizado');
  }

  const account = await context.entities.Account.findUnique({
    where: { id: args.id },
  });

  if (!account || account.userId !== context.user.id) {
    throw new HttpError(404, 'Conta não encontrada');
  }

  await context.entities.Account.delete({
    where: { id: args.id },
  });
}

// ==================== CATEGORIES ====================

export const getCategories: GetCategories<void, Category[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autorizado');
  }

  return context.entities.Category.findMany({
    where: { userId: context.user.id },
    orderBy: { name: 'asc' },
  });
}

type CreateCategoryInput = Pick<Category, 'name' | 'type' | 'color' | 'icon' | 'description'>
export const createCategory: CreateCategory<CreateCategoryInput, Category> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autorizado');
  }

  return context.entities.Category.create({
    data: {
      ...args,
      userId: context.user.id,
    },
  });
}

type UpdateCategoryInput = Pick<Category, 'id'> & Partial<Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
export const updateCategory: UpdateCategory<UpdateCategoryInput, Category> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autorizado');
  }

  const category = await context.entities.Category.findUnique({
    where: { id: args.id },
  });

  if (!category || category.userId !== context.user.id) {
    throw new HttpError(404, 'Categoria não encontrada');
  }

  const { id, ...updateData } = args;
  return context.entities.Category.update({
    where: { id },
    data: updateData,
  });
}

export const deleteCategory: DeleteCategory<{ id: string }, void> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autorizado');
  }

  const category = await context.entities.Category.findUnique({
    where: { id: args.id },
  });

  if (!category || category.userId !== context.user.id) {
    throw new HttpError(404, 'Categoria não encontrada');
  }

  await context.entities.Category.delete({
    where: { id: args.id },
  });
}

// ==================== TRANSACTIONS ====================

type GetTransactionsInput = {
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export const getTransactions: GetTransactions<GetTransactionsInput, Transaction[]> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autorizado');
  }

  const where: any = {
    userId: context.user.id,
  };

  if (args.accountId) where.accountId = args.accountId;
  if (args.categoryId) where.categoryId = args.categoryId;
  if (args.type) where.type = args.type;
  if (args.startDate || args.endDate) {
    where.date = {};
    if (args.startDate) where.date.gte = args.startDate;
    if (args.endDate) where.date.lte = args.endDate;
  }

  return context.entities.Transaction.findMany({
    where,
    include: {
      account: true,
      category: true,
      transferFromAccount: true,
      transferToAccount: true,
    },
    orderBy: { date: 'desc' },
    take: args.limit || 100,
  });
}

type CreateTransactionInput = Pick<Transaction, 
  'accountId' | 'type' | 'amount' | 'description' | 'date' | 'categoryId' | 'notes' | 'tags' | 
  'isRecurring' | 'recurringFrequency' | 'transferFromAccountId' | 'transferToAccountId'
>

export const createTransaction: CreateTransaction<CreateTransactionInput, Transaction> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autorizado');
  }

  // Verifica se a conta pertence ao usuário
  const account = await context.entities.Account.findUnique({
    where: { id: args.accountId },
  });

  if (!account || account.userId !== context.user.id) {
    throw new HttpError(404, 'Conta não encontrada');
  }

  // Cria a transação
  const transaction = await context.entities.Transaction.create({
    data: {
      ...args,
      userId: context.user.id,
    },
    include: {
      account: true,
      category: true,
    },
  });

  // Atualiza o saldo da conta
  let newBalance = account.balance;
  
  if (args.type === TransactionType.INCOME) {
    newBalance += args.amount;
  } else if (args.type === TransactionType.EXPENSE) {
    newBalance -= args.amount;
  } else if (args.type === TransactionType.TRANSFER) {
    // Para transferências, atualiza ambas as contas
    if (args.transferFromAccountId && args.transferToAccountId) {
      // Remove da conta de origem
      await context.entities.Account.update({
        where: { id: args.transferFromAccountId },
        data: {
          balance: {
            decrement: args.amount,
          },
        },
      });
      // Adiciona na conta de destino
      await context.entities.Account.update({
        where: { id: args.transferToAccountId },
        data: {
          balance: {
            increment: args.amount,
          },
        },
      });
    }
  }

  // Atualiza o saldo da conta principal
  if (args.type !== TransactionType.TRANSFER) {
    await context.entities.Account.update({
      where: { id: args.accountId },
      data: { balance: newBalance },
    });
  }

  return transaction;
}

type UpdateTransactionInput = Pick<Transaction, 'id'> & Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
export const updateTransaction: UpdateTransaction<UpdateTransactionInput, Transaction> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autorizado');
  }

  const transaction = await context.entities.Transaction.findUnique({
    where: { id: args.id },
    include: { account: true },
  });

  if (!transaction || transaction.userId !== context.user.id) {
    throw new HttpError(404, 'Transação não encontrada');
  }

  // Reverte o efeito da transação antiga no saldo
  let newBalance = transaction.account.balance;
  if (transaction.type === TransactionType.INCOME) {
    newBalance -= transaction.amount;
  } else if (transaction.type === TransactionType.EXPENSE) {
    newBalance += transaction.amount;
  }

  // Atualiza a transação
  const { id, ...updateData } = args;
  const updatedTransaction = await context.entities.Transaction.update({
    where: { id },
    data: updateData,
    include: {
      account: true,
      category: true,
    },
  });

  // Aplica o efeito da nova transação no saldo
  const finalAmount = args.amount !== undefined ? args.amount : transaction.amount;
  const finalType = args.type !== undefined ? args.type : transaction.type;
  
  if (finalType === TransactionType.INCOME) {
    newBalance += finalAmount;
  } else if (finalType === TransactionType.EXPENSE) {
    newBalance -= finalAmount;
  }

  // Atualiza o saldo da conta
  await context.entities.Account.update({
    where: { id: transaction.accountId },
    data: { balance: newBalance },
  });

  return updatedTransaction;
}

export const deleteTransaction: DeleteTransaction<{ id: string }, void> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autorizado');
  }

  const transaction = await context.entities.Transaction.findUnique({
    where: { id: args.id },
    include: { account: true },
  });

  if (!transaction || transaction.userId !== context.user.id) {
    throw new HttpError(404, 'Transação não encontrada');
  }

  // Reverte o efeito da transação no saldo
  let newBalance = transaction.account.balance;
  if (transaction.type === TransactionType.INCOME) {
    newBalance -= transaction.amount;
  } else if (transaction.type === TransactionType.EXPENSE) {
    newBalance += transaction.amount;
  }

  // Atualiza o saldo da conta
  await context.entities.Account.update({
    where: { id: transaction.accountId },
    data: { balance: newBalance },
  });

  // Deleta a transação
  await context.entities.Transaction.delete({
    where: { id: args.id },
  });
}

// ==================== DASHBOARD STATS ====================

type DashboardStats = {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  accountsCount: number;
  recentTransactions: Transaction[];
  expensesByCategory: Array<{ categoryName: string; total: number; color: string | null }>;
}

export const getDashboardStats: GetDashboardStats<void, DashboardStats> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autorizado');
  }

  // Pega todas as contas ativas
  const accounts = await context.entities.Account.findMany({
    where: { userId: context.user.id, isActive: true },
  });

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const accountsCount = accounts.length;

  // Calcula o início e fim do mês atual
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Pega transações do mês
  const monthlyTransactions = await context.entities.Transaction.findMany({
    where: {
      userId: context.user.id,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      category: true,
    },
  });

  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  // Pega transações recentes
  const recentTransactions = await context.entities.Transaction.findMany({
    where: { userId: context.user.id },
    include: {
      account: true,
      category: true,
    },
    orderBy: { date: 'desc' },
    take: 10,
  });

  // Agrupa despesas por categoria
  const expensesByCategory: Record<string, { categoryName: string; total: number; color: string | null }> = {};
  
  monthlyTransactions
    .filter(t => t.type === TransactionType.EXPENSE && t.category)
    .forEach(transaction => {
      const categoryName = transaction.category?.name || 'Sem categoria';
      const color = transaction.category?.color || null;
      
      if (!expensesByCategory[categoryName]) {
        expensesByCategory[categoryName] = { categoryName, total: 0, color };
      }
      expensesByCategory[categoryName].total += transaction.amount;
    });

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    accountsCount,
    recentTransactions,
    expensesByCategory: Object.values(expensesByCategory).sort((a, b) => b.total - a.total),
  };
}

// ==================== BUDGETS ====================

export const getBudgets: GetBudgets<void, Budget[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autorizado');
  }

  return context.entities.Budget.findMany({
    where: { userId: context.user.id },
    include: {
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

type CreateBudgetInput = Pick<Budget, 'categoryId' | 'name' | 'amount' | 'period' | 'startDate'> & { endDate?: Date | null }
export const createBudget: CreateBudget<CreateBudgetInput, Budget> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autorizado');
  }

  // Verifica se a categoria pertence ao usuário
  const category = await context.entities.Category.findUnique({
    where: { id: args.categoryId },
  });

  if (!category || category.userId !== context.user.id) {
    throw new HttpError(404, 'Categoria não encontrada');
  }

  return context.entities.Budget.create({
    data: {
      ...args,
      userId: context.user.id,
    },
    include: {
      category: true,
    },
  });
}

type UpdateBudgetInput = Pick<Budget, 'id'> & Partial<Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> & { endDate?: Date | null }
export const updateBudget: UpdateBudget<UpdateBudgetInput, Budget> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autorizado');
  }

  const budget = await context.entities.Budget.findUnique({
    where: { id: args.id },
  });

  if (!budget || budget.userId !== context.user.id) {
    throw new HttpError(404, 'Orçamento não encontrado');
  }

  const { id, ...updateData } = args;
  return context.entities.Budget.update({
    where: { id },
    data: updateData,
    include: {
      category: true,
    },
  });
}

export const deleteBudget: DeleteBudget<{ id: string }, void> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autorizado');
  }

  const budget = await context.entities.Budget.findUnique({
    where: { id: args.id },
  });

  if (!budget || budget.userId !== context.user.id) {
    throw new HttpError(404, 'Orçamento não encontrado');
  }

  await context.entities.Budget.delete({
    where: { id: args.id },
  });
}

// ==================== BUDGET ALERTS ====================

type BudgetWithSpending = Budget & {
  category: Category;
  spent: number;
  percentage: number;
  remaining: number;
  isOverBudget: boolean;
  alertLevel: 'safe' | 'warning' | 'danger' | 'exceeded';
}

type GetBudgetAlertsResult = {
  budgets: BudgetWithSpending[];
  alertCount: number;
  dangerCount: number;
  warningCount: number;
}

export const getBudgetAlerts: GetBudgetAlerts<void, GetBudgetAlertsResult> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autorizado');
  }

  // Busca todos os orçamentos ativos
  const budgets = await context.entities.Budget.findMany({
    where: { 
      userId: context.user.id,
      isActive: true,
    },
    include: {
      category: true,
    },
  });

  const now = new Date();
  
  // Calcula os gastos para cada orçamento
  const budgetsWithSpending: BudgetWithSpending[] = await Promise.all(
    budgets.map(async (budget) => {
      // Determina o período baseado no tipo de orçamento
      let startDate = new Date(budget.startDate);
      let endDate = budget.endDate ? new Date(budget.endDate) : new Date();
      
      // Ajusta o período baseado no tipo
      if (budget.period === 'WEEKLY') {
        // Última semana a partir da data de início
        const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const weeksComplete = Math.floor(daysSinceStart / 7);
        startDate = new Date(startDate.getTime() + (weeksComplete * 7 * 24 * 60 * 60 * 1000));
        endDate = new Date(startDate.getTime() + (7 * 24 * 60 * 60 * 1000));
      } else if (budget.period === 'MONTHLY') {
        // Mês atual
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      } else if (budget.period === 'YEARLY') {
        // Ano atual
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      }

      // Busca as transações do período
      const transactions = await context.entities.Transaction.findMany({
        where: {
          userId: context.user!.id,
          categoryId: budget.categoryId,
          type: TransactionType.EXPENSE,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // Calcula o total gasto
      const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
      const percentage = budget.amount > 0 ? (spent / budget.amount * 100) : 0;
      const remaining = budget.amount - spent;
      const isOverBudget = spent > budget.amount;

      // Define o nível de alerta
      let alertLevel: 'safe' | 'warning' | 'danger' | 'exceeded' = 'safe';
      if (isOverBudget) {
        alertLevel = 'exceeded';
      } else if (percentage >= 90) {
        alertLevel = 'danger';
      } else if (percentage >= 75) {
        alertLevel = 'warning';
      }

      return {
        ...budget,
        category: budget.category,
        spent,
        percentage,
        remaining,
        isOverBudget,
        alertLevel,
      };
    })
  );

  // Conta os alertas
  const alertCount = budgetsWithSpending.filter(b => b.alertLevel !== 'safe').length;
  const dangerCount = budgetsWithSpending.filter(b => b.alertLevel === 'danger' || b.alertLevel === 'exceeded').length;
  const warningCount = budgetsWithSpending.filter(b => b.alertLevel === 'warning').length;

  // Ordena por nível de alerta (mais críticos primeiro)
  budgetsWithSpending.sort((a, b) => {
    const alertOrder = { exceeded: 0, danger: 1, warning: 2, safe: 3 };
    return alertOrder[a.alertLevel] - alertOrder[b.alertLevel];
  });

  return {
    budgets: budgetsWithSpending,
    alertCount,
    dangerCount,
    warningCount,
  };
}

