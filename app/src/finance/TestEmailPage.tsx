import { useState } from 'react';
import { sendTestEmail } from 'wasp/client/operations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const TEST_EMAIL = 'jairorudasp@gmail.com';

export default function TestEmailPage() {
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSendTest = async () => {
    setIsSending(true);
    setResult(null);

    try {
      await sendTestEmail({ email: TEST_EMAIL });
      setResult({
        success: true,
        message: `Email de teste enviado com sucesso para ${TEST_EMAIL}! Verifique sua caixa de entrada.`
      });
    } catch (error: any) {
      console.error('Erro ao enviar email:', error);
      setResult({
        success: false,
        message: `Erro ao enviar email: ${error.message || 'Erro desconhecido'}`
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Testar Email</h1>
          <p className="text-gray-600">Envie um email de teste para verificar a configuração do Resend</p>
        </div>

        {/* Test Email Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Enviar Email de Teste
            </CardTitle>
            <CardDescription>
              Configure o Resend e teste o envio de emails. Um email bem formatado será enviado para o endereço especificado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Email Info */}
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">📧 Email de Destino</h3>
                <p className="text-lg font-mono text-gray-800">{TEST_EMAIL}</p>
              </div>

              {/* Configuration Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">📝 Configuração Necessária</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>RESEND_API_KEY</strong> configurada no .env.server</li>
                  <li>• <strong>RESEND_FROM_EMAIL</strong> com domínio verificado</li>
                  <li>• Conta ativa no Resend (https://resend.com)</li>
                </ul>
              </div>

              {/* Result Alert */}
              {result && (
                <Alert className={result.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                  <div className="flex items-start gap-2">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                      {result.message}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="button"
                onClick={handleSendTest}
                disabled={isSending}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Email de Teste para {TEST_EMAIL}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">O que será enviado?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              <ul className="space-y-1">
                <li>✅ Email HTML profissional</li>
                <li>✅ Confirmação da configuração</li>
                <li>✅ Lista de funcionalidades ativas</li>
                <li>✅ Detalhes da configuração</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Problemas?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              <ul className="space-y-1">
                <li>• Verifique a API key do Resend</li>
                <li>• Confirme o domínio verificado</li>
                <li>• Consulte os logs do servidor</li>
                <li>• Leia o GUIA-EMAIL-RESEND.md</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
