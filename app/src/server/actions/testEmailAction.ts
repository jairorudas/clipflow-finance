import type { SendTestEmail } from 'wasp/server/operations';
import { sendTestEmail } from '../email/testEmail';

type SendTestEmailArgs = {
  email: string;
};

export const sendTestEmailAction: SendTestEmail<SendTestEmailArgs, any> = async (args, _context) => {
  const emailToSend = args.email;

  if (!emailToSend) {
    throw new Error('Email não fornecido');
  }

  console.log(`🧪 Iniciando teste de email para: ${emailToSend}`);

  const result = await sendTestEmail(emailToSend);

  return result;
};
