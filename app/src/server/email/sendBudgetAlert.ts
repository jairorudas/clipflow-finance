import { emailSender } from 'wasp/server/email';
import type { User } from 'wasp/entities';

type SendBudgetAlertInput = {
  userEmail: string;
  userName: string;
  budgetName: string;
  percentage: number;
  spent: number;
  limit: number;
};

type SendBudgetAlertContext = {
  user?: User;
  entities: any;
};

/**
 * Envia email de alerta quando orçamento está próximo do limite
 * Esta função roda NO SERVIDOR, sem problemas de CORS!
 */
export const sendBudgetAlert = async (
  args: SendBudgetAlertInput,
  context: SendBudgetAlertContext
): Promise<void> => {
  if (!context.user) {
    throw new Error('Usuário não autenticado');
  }

  const { userEmail, userName, budgetName, percentage, spent, limit } = args;

  // Determinar nível de alerta
  const alertLevel = percentage >= 100 ? 'EXCEDIDO' : percentage >= 90 ? 'CRÍTICO' : 'ATENÇÃO';
  const emoji = percentage >= 100 ? '🚨' : percentage >= 90 ? '⚠️' : '📊';

  // HTML do email
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .alert-icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .alert-level {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 4px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .alert-warning { background: #fef3c7; color: #92400e; }
          .alert-danger { background: #fee2e2; color: #991b1b; }
          .alert-critical { background: #dbeafe; color: #1e40af; }
          .stats {
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .stat-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .stat-row:last-child { border-bottom: none; }
          .stat-label { font-weight: 600; color: #6b7280; }
          .stat-value { font-weight: bold; }
          .progress-bar {
            width: 100%;
            height: 24px;
            background: #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
            margin: 15px 0;
          }
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #2563eb);
            transition: width 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
          }
          .progress-fill.warning { background: linear-gradient(90deg, #f59e0b, #d97706); }
          .progress-fill.danger { background: linear-gradient(90deg, #ef4444, #dc2626); }
          .button {
            display: inline-block;
            background: #000000;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 20px;
            text-align: center;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="alert-icon">${emoji}</div>
            <h1 style="margin: 0; color: #111827;">Alerta de Orçamento</h1>
            <span class="alert-level ${percentage >= 100 ? 'alert-danger' : percentage >= 90 ? 'alert-critical' : 'alert-warning'}">
              ${alertLevel}
            </span>
          </div>

          <p>Olá <strong>${userName}</strong>,</p>
          
          <p>Seu orçamento <strong>"${budgetName}"</strong> está em <strong>${percentage.toFixed(1)}%</strong> do limite.</p>

          <div class="progress-bar">
            <div class="progress-fill ${percentage >= 90 ? 'danger' : percentage >= 80 ? 'warning' : ''}" 
                 style="width: ${Math.min(percentage, 100)}%">
              ${percentage.toFixed(1)}%
            </div>
          </div>

          <div class="stats">
            <div class="stat-row">
              <span class="stat-label">Gasto Total:</span>
              <span class="stat-value" style="color: #ef4444;">R$ ${spent.toFixed(2)}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Limite do Orçamento:</span>
              <span class="stat-value" style="color: #6b7280;">R$ ${limit.toFixed(2)}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Restante:</span>
              <span class="stat-value" style="color: ${limit - spent < 0 ? '#ef4444' : '#10b981'};">
                R$ ${(limit - spent).toFixed(2)}
              </span>
            </div>
          </div>

          ${percentage >= 100 
            ? `<p style="color: #991b1b; font-weight: 600;">⚠️ Você já ultrapassou o limite deste orçamento!</p>`
            : percentage >= 90
            ? `<p style="color: #1e40af; font-weight: 600;">⚠️ Atenção! Você está próximo de ultrapassar o limite.</p>`
            : `<p style="color: #92400e;">📊 Fique atento aos seus gastos para não ultrapassar o orçamento.</p>`
          }

          <div style="text-align: center;">
            <a href="${process.env.WASP_WEB_CLIENT_URL || 'https://clipflow.space'}/budgets" class="button">
              Ver Orçamentos
            </a>
          </div>

          <div class="footer">
            <p>Este é um alerta automático do ClipFlow.</p>
            <p>Você pode gerenciar suas notificações nas configurações.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Texto plano (fallback)
  const textContent = `
    ${emoji} Alerta de Orçamento - ${alertLevel}

    Olá ${userName},

    Seu orçamento "${budgetName}" está em ${percentage.toFixed(1)}% do limite.

    Gasto Total: R$ ${spent.toFixed(2)}
    Limite: R$ ${limit.toFixed(2)}
    Restante: R$ ${(limit - spent).toFixed(2)}

    ${percentage >= 100 
      ? 'ATENÇÃO: Você já ultrapassou o limite deste orçamento!'
      : 'Fique atento aos seus gastos.'
    }

    Ver orçamentos: ${process.env.WASP_WEB_CLIENT_URL || 'https://clipflow.space'}/budgets

    ---
    ClipFlow - Controle suas finanças
  `;

  try {
    // Enviar email usando o emailSender configurado no Wasp
    // Isto usa automaticamente o SMTP configurado (SendGrid/Resend)
    await emailSender.send({
      to: userEmail,
      subject: `${emoji} Alerta: Orçamento "${budgetName}" em ${percentage.toFixed(0)}%`,
      text: textContent,
      html: htmlContent,
    });

    console.log(`✅ Email de alerta enviado para ${userEmail} sobre orçamento "${budgetName}"`);
  } catch (error) {
    console.error('❌ Erro ao enviar email de alerta:', error);
    throw new Error('Falha ao enviar email de alerta');
  }
};

