import type { DailyBudgetAlerts } from 'wasp/server/jobs';
import { sendBudgetAlert, formatBudgetPeriod, type AlertLevel } from '../email/budgetAlerts';
import { TransactionType } from '@prisma/client';

type JobArgs = Record<string, never>;

export const checkBudgetAlerts: DailyBudgetAlerts<JobArgs, any> = async (_args, context) => {
  console.log('🔍 Iniciando verificação de alertas de orçamento...');

  try {
    // Busca todos os orçamentos ativos
    const budgets = await context.entities.Budget.findMany({
      where: {
        isActive: true,
      },
      include: {
        user: true,
        category: true,
      },
    });

    console.log(`📊 Encontrados ${budgets.length} orçamentos ativos`);

    const now = new Date();
    let alertsSent = 0;
    let alertsSkipped = 0;

    // Processa cada orçamento
    for (const budget of budgets) {
      try {
        // Pula se o usuário não tem email
        if (!budget.user.email) {
          console.log(`⏭️  Orçamento ${budget.name}: usuário sem email`);
          alertsSkipped++;
          continue;
        }

        // Determina o período baseado no tipo de orçamento
        let startDate = new Date(budget.startDate);
        let endDate = budget.endDate ? new Date(budget.endDate) : new Date();

        // Ajusta o período baseado no tipo
        if (budget.period === 'WEEKLY') {
          const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          const weeksComplete = Math.floor(daysSinceStart / 7);
          startDate = new Date(startDate.getTime() + (weeksComplete * 7 * 24 * 60 * 60 * 1000));
          endDate = new Date(startDate.getTime() + (7 * 24 * 60 * 60 * 1000));
        } else if (budget.period === 'MONTHLY') {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        } else if (budget.period === 'YEARLY') {
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        }

        // Busca as transações do período
        const transactions = await context.entities.Transaction.findMany({
          where: {
            userId: budget.userId,
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
        let alertLevel: AlertLevel | null = null;
        if (isOverBudget) {
          alertLevel = 'exceeded';
        } else if (percentage >= 90) {
          alertLevel = 'danger';
        } else if (percentage >= 75) {
          alertLevel = 'warning';
        }

        // Envia alerta apenas se houver um nível de alerta
        if (alertLevel) {
          console.log(`📧 Enviando alerta ${alertLevel} para ${budget.user.email} (${budget.name}: ${percentage.toFixed(1)}%)`);

          await sendBudgetAlert({
            userEmail: budget.user.email,
            userName: budget.user.username || undefined,
            budgetName: budget.name,
            categoryName: budget.category.name,
            spent,
            limit: budget.amount,
            percentage,
            remaining,
            alertLevel,
            period: formatBudgetPeriod(budget.period, startDate, endDate),
          });

          alertsSent++;
        } else {
          console.log(`✅ Orçamento ${budget.name} está OK (${percentage.toFixed(1)}%)`);
          alertsSkipped++;
        }
      } catch (error) {
        console.error(`❌ Erro ao processar orçamento ${budget.name}:`, error);
        // Continua processando os outros orçamentos
      }
    }

    console.log(`✨ Verificação concluída: ${alertsSent} alertas enviados, ${alertsSkipped} pulados`);

    return {
      success: true,
      budgetsChecked: budgets.length,
      alertsSent,
      alertsSkipped,
    };
  } catch (error) {
    console.error('❌ Erro na verificação de alertas de orçamento:', error);
    throw error;
  }
};
