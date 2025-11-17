import { sendCustomEmail } from './customEmailProvider';

/**
 * Função de teste para enviar email via Resend
 * Use esta função apenas para testar se o email está funcionando
 */
export async function sendTestEmail(toEmail: string) {
  try {
    console.log(`📧 Enviando email de teste para ${toEmail}...`);

    const result = await sendCustomEmail({
      to: toEmail,
      subject: '🎉 Email de Teste - CashFlow App',
      html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email de Teste</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px;">🎉</h1>
              <h2 style="margin: 10px 0 0 0; color: #ffffff; font-size: 24px; font-weight: 600;">Email de Teste Funcionando!</h2>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                Olá!
              </p>

              <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                Se você está lendo este email, significa que o sistema de envio de emails do <strong>CashFlow App</strong> está funcionando perfeitamente! 🚀
              </p>

              <!-- Info Box -->
              <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; color: #065f46;">
                  <strong>✅ Configuração Bem-Sucedida</strong><br>
                  O provedor de email Resend está configurado corretamente e pronto para enviar notificações e alertas.
                </p>
              </div>

              <!-- Features List -->
              <h3 style="color: #111827; font-size: 18px; margin: 30px 0 15px 0;">Funcionalidades Ativas:</h3>
              <ul style="color: #374151; line-height: 1.8; padding-left: 20px;">
                <li>📊 <strong>Alertas de Orçamento</strong> - Notificações automáticas quando você atingir 75%, 90% ou ultrapassar seus orçamentos</li>
                <li>🔔 <strong>Notificações Personalizadas</strong> - Emails customizados para eventos importantes</li>
                <li>⏰ <strong>Verificação Diária</strong> - Sistema automático rodando todos os dias às 9h</li>
                <li>💌 <strong>Templates Profissionais</strong> - Emails bem formatados e responsivos</li>
              </ul>

              <!-- Stats Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <tr>
                  <td>
                    <h4 style="margin: 0 0 10px 0; color: #111827; font-size: 14px;">Detalhes da Configuração:</h4>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 5px 0; color: #6b7280; font-size: 14px;">Provedor:</td>
                        <td style="padding: 5px 0; color: #111827; font-size: 14px; text-align: right;"><strong>Resend</strong></td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #6b7280; font-size: 14px;">Status:</td>
                        <td style="padding: 5px 0; color: #10b981; font-size: 14px; text-align: right;"><strong>✅ Ativo</strong></td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #6b7280; font-size: 14px;">Data do Teste:</td>
                        <td style="padding: 5px 0; color: #111827; font-size: 14px; text-align: right;"><strong>${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</strong></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin: 30px 0;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #1e40af;">
                  <strong>📝 Próximos Passos:</strong>
                </p>
                <ol style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.8;">
                  <li>Crie orçamentos na aplicação</li>
                  <li>Configure os limites de gastos</li>
                  <li>Receba alertas automáticos por email</li>
                  <li>Mantenha suas finanças sob controle</li>
                </ol>
              </div>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 30px 0 10px 0;">
                    <a href="${process.env.WASP_WEB_CLIENT_URL || 'http://localhost:3000'}/finance/budgets"
                       style="background-color: #6366f1; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
                      Acessar CashFlow App
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280; text-align: center;">
                Tudo pronto para começar! 💪
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                Este é um email de teste do sistema CashFlow App
                <br>
                Enviado em ${new Date().toLocaleString('pt-BR')}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      text: `
🎉 EMAIL DE TESTE FUNCIONANDO!

Olá!

Se você está lendo este email, significa que o sistema de envio de emails do CashFlow App está funcionando perfeitamente! 🚀

✅ CONFIGURAÇÃO BEM-SUCEDIDA
O provedor de email Resend está configurado corretamente e pronto para enviar notificações e alertas.

FUNCIONALIDADES ATIVAS:
• 📊 Alertas de Orçamento - Notificações automáticas quando você atingir 75%, 90% ou ultrapassar seus orçamentos
• 🔔 Notificações Personalizadas - Emails customizados para eventos importantes
• ⏰ Verificação Diária - Sistema automático rodando todos os dias às 9h
• 💌 Templates Profissionais - Emails bem formatados e responsivos

DETALHES DA CONFIGURAÇÃO:
• Provedor: Resend
• Status: ✅ Ativo
• Data do Teste: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}

PRÓXIMOS PASSOS:
1. Crie orçamentos na aplicação
2. Configure os limites de gastos
3. Receba alertas automáticos por email
4. Mantenha suas finanças sob controle

Acesse: ${process.env.WASP_WEB_CLIENT_URL || 'http://localhost:3000'}/finance/budgets

Tudo pronto para começar! 💪

---
Este é um email de teste do sistema CashFlow App
Enviado em ${new Date().toLocaleString('pt-BR')}
      `
    });

    console.log('✅ Email de teste enviado com sucesso!');
    console.log('Resultado:', result);

    return {
      success: true,
      message: 'Email enviado com sucesso!',
      result
    };
  } catch (error) {
    console.error('❌ Erro ao enviar email de teste:', error);
    throw error;
  }
}
