import { Resend } from 'resend';

// Inicializa o cliente Resend com a API key do ambiente
const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * Envia email usando o provedor Resend
 * @param args Parâmetros do email
 * @returns Resultado do envio
 */
export async function sendCustomEmail({
  to,
  subject,
  html,
  text,
  from = process.env.RESEND_FROM_EMAIL || 'noreply@seudominio.com'
}: SendEmailArgs) {
  try {
    // Verifica se a API key está configurada
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY não configurada. Email não será enviado.');
      console.log('Email que seria enviado:', { to, subject, from });
      return { success: false, message: 'RESEND_API_KEY não configurada' };
    }

    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    console.log('Email enviado com sucesso via Resend:', { to, subject, id: result.data?.id });
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Erro ao enviar email via Resend:', error);
    throw error;
  }
}

/**
 * Envia emails em lote (útil para notificações múltiplas)
 * @param emails Array de emails para enviar
 * @returns Resultado do envio em lote
 */
export async function sendBatchEmails(emails: SendEmailArgs[]) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY não configurada. Emails não serão enviados.');
      return { success: false, message: 'RESEND_API_KEY não configurada' };
    }

    const results = await Promise.allSettled(
      emails.map(email => sendCustomEmail(email))
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Lote de emails: ${succeeded} enviados, ${failed} falharam`);

    return { success: true, succeeded, failed, results };
  } catch (error) {
    console.error('Erro ao enviar lote de emails:', error);
    throw error;
  }
}
