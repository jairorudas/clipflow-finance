import { sendCustomEmail } from './customEmailProvider';

export type AlertLevel = 'warning' | 'danger' | 'exceeded';

export interface BudgetAlertParams {
  userEmail: string;
  userName?: string;
  budgetName: string;
  categoryName: string;
  spent: number;
  limit: number;
  percentage: number;
  remaining: number;
  alertLevel: AlertLevel;
  period: string;
}

/**
 * Envia alerta de orçamento por email
 */
export async function sendBudgetAlert(params: BudgetAlertParams) {
  const {
    userEmail,
    userName,
    budgetName,
    categoryName,
    spent,
    limit,
    percentage,
    remaining,
    alertLevel,
    period
  } = params;

  // Define mensagens por nível de alerta
  const alertConfig = {
    warning: {
      emoji: '⚠️',
      color: '#f59e0b',
      title: 'Atenção: Orçamento em Alerta',
      message: `Você gastou ${percentage.toFixed(0)}% do seu orçamento`
    },
    danger: {
      emoji: '🚨',
      color: '#ef4444',
      title: 'URGENTE: Orçamento Crítico',
      message: `Você gastou ${percentage.toFixed(0)}% do seu orçamento`
    },
    exceeded: {
      emoji: '❌',
      color: '#dc2626',
      title: 'ALERTA: Orçamento Ultrapassado',
      message: `Você ultrapassou o orçamento em ${Math.abs(remaining).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
    }
  };

  const config = alertConfig[alertLevel];
  const greeting = userName ? `Olá ${userName}` : 'Olá';

  const subject = `${config.emoji} ${config.title} - ${budgetName}`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: ${config.color}; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px;">${config.emoji}</h1>
              <h2 style="margin: 10px 0 0 0; color: #ffffff; font-size: 24px; font-weight: 600;">${config.title}</h2>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.5;">
                ${greeting},
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; color: #374151; line-height: 1.5;">
                ${config.message} "<strong>${budgetName}</strong>" na categoria <strong>${categoryName}</strong>.
              </p>

              <!-- Stats Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 0;">
                          <span style="color: #6b7280; font-size: 14px;">Período:</span>
                          <br>
                          <strong style="color: #111827; font-size: 16px;">${period}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-top: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 14px;">Gasto Atual:</span>
                          <br>
                          <strong style="color: #ef4444; font-size: 20px;">${spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-top: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 14px;">Limite do Orçamento:</span>
                          <br>
                          <strong style="color: #111827; font-size: 20px;">${limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-top: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 14px;">Percentual Utilizado:</span>
                          <br>
                          <strong style="color: ${config.color}; font-size: 24px;">${percentage.toFixed(1)}%</strong>
                        </td>
                      </tr>
                      ${remaining > 0 ? `
                      <tr>
                        <td style="padding: 10px 0; border-top: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 14px;">Saldo Restante:</span>
                          <br>
                          <strong style="color: #10b981; font-size: 18px;">${remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                        </td>
                      </tr>
                      ` : `
                      <tr>
                        <td style="padding: 10px 0; border-top: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 14px;">Valor Excedente:</span>
                          <br>
                          <strong style="color: #dc2626; font-size: 18px;">${Math.abs(remaining).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                        </td>
                      </tr>
                      `}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Progress Bar -->
              <div style="margin-bottom: 30px;">
                <div style="background-color: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden;">
                  <div style="background-color: ${config.color}; height: 100%; width: ${Math.min(percentage, 100)}%; transition: width 0.3s ease;"></div>
                </div>
              </div>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${process.env.WASP_WEB_CLIENT_URL || 'http://localhost:3000'}/finance/budgets"
                       style="background-color: #6366f1; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
                      Ver Detalhes do Orçamento
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Tips -->
              ${alertLevel === 'exceeded' || alertLevel === 'danger' ? `
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin-top: 30px;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>💡 Dica:</strong> Considere revisar seus gastos nesta categoria ou ajustar o valor do orçamento.
                </p>
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                Este é um email automático de alerta de orçamento.
                <br>
                Você recebeu este email porque configurou alertas para o orçamento "${budgetName}".
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `
${config.emoji} ${config.title}

${greeting},

${config.message} "${budgetName}" na categoria ${categoryName}.

Período: ${period}
Gasto Atual: ${spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
Limite do Orçamento: ${limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
Percentual Utilizado: ${percentage.toFixed(1)}%
${remaining > 0
  ? `Saldo Restante: ${remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
  : `Valor Excedente: ${Math.abs(remaining).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
}

Ver detalhes: ${process.env.WASP_WEB_CLIENT_URL || 'http://localhost:3000'}/finance/budgets

---
Este é um email automático de alerta de orçamento.
`;

  return sendCustomEmail({
    to: userEmail,
    subject,
    html,
    text,
  });
}

/**
 * Formata o período do orçamento para exibição
 */
export function formatBudgetPeriod(period: string, startDate: Date, endDate?: Date | null): string {
  const periodLabels: Record<string, string> = {
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensal',
    YEARLY: 'Anual',
    CUSTOM: 'Personalizado'
  };

  const label = periodLabels[period] || period;
  const start = new Date(startDate).toLocaleDateString('pt-BR');
  const end = endDate ? new Date(endDate).toLocaleDateString('pt-BR') : 'Atual';

  return `${label} (${start} - ${end})`;
}
