
import { WhatsAppConfig } from '../types';

export const sendWhatsAppMessage = async (
  to: string, 
  text: string, 
  config: WhatsAppConfig
): Promise<{ success: boolean; error?: string }> => {
  // Limpa o número (apenas dígitos)
  const cleanPhone = to.replace(/\D/g, '');

  if (config.method === 'official') {
    if (!config.accessToken || !config.phoneNumberId) {
      return { success: false, error: 'Configuração da Cloud API incompleta.' };
    }

    try {
      // Atualizado para v22.0 conforme documentação fornecida pelo usuário
      const response = await fetch(
        `https://graph.facebook.com/v22.0/${config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanPhone,
            type: 'text',
            text: { body: text },
          }),
        }
      );

      const data = await response.json();
      if (response.ok) return { success: true };
      
      // Tratamento de erros detalhado
      const errorMessage = data.error?.message || 'Erro desconhecido na Cloud API';
      console.error('WhatsApp API Error:', data.error);
      return { success: false, error: errorMessage };
    } catch (err) {
      console.error('Network error calling WhatsApp API:', err);
      return { success: false, error: 'Falha na requisição ao Facebook. Verifique sua conexão.' };
    }
  }

  if (config.method === 'gateway' && config.gatewayUrl) {
    try {
      const response = await fetch(config.gatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.gatewayApiKey || '',
        },
        body: JSON.stringify({
          number: cleanPhone,
          text: text,
        }),
      });

      if (response.ok) return { success: true };
      return { success: false, error: 'Erro no Gateway de mensagens' };
    } catch (err) {
      return { success: false, error: 'Falha na conexão com o Gateway' };
    }
  }

  // Fallback Manual (wa.me)
  const encodedText = encodeURIComponent(text);
  window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
  return { success: true };
};
