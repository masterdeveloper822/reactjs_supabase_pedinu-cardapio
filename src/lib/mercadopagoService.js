import { supabase } from '@/lib/customSupabaseClient';

class MercadoPagoService {
  constructor() {
    this.baseUrl = 'https://api.mercadopago.com';
  }

  // Create payment with automatic split
  async createPaymentWithSplit(paymentData, businessSettings) {
    try {
      const {
        amount,
        description,
        customerEmail,
        customerName,
        customerPhone,
        paymentMethod,
        items,
        businessUserId
      } = paymentData;

      // Fixed 5% platform fee for all businesses
      const platformFeePercentage = 5;
      // Calculate and round to 2 decimals
      const platformFeeAmount = Math.round((amount * platformFeePercentage) ) / 100;
      let businessAmount = Math.round((amount - platformFeeAmount) * 100) / 100;
      // Guarantee the sum matches exactly
      if (Math.abs((businessAmount + platformFeeAmount) - amount) > 0.001) {
        businessAmount = Math.round((amount - platformFeeAmount) * 100) / 100;
      }

      const businessAccessToken = businessSettings?.mercadopago_access_token;

      if (!businessAccessToken) {
        throw new Error('As credenciais de pagamento do negócio não estão configuradas. Por favor, contate o suporte.');
      }

      // Create payment preference with split
      const paymentPreference = {
        items: items.map(item => ({
          title: item.name,
          quantity: item.quantity,
          unit_price: item.price
        })),
        payer: {
          name: customerName,
          email: customerEmail,
          phone: {
            number: customerPhone
          }
        },
        payment_methods: {
          excluded_payment_types: paymentMethod === 'Pix' ? [] : [{ id: 'ticket' }],
          excluded_payment_methods: paymentMethod === 'Pix' ? [] : [{ id: 'pix' }],
          installments: paymentMethod === 'Cartão de Crédito' ? 12 : 1
        },
        application_fee: platformFeeAmount,
        external_reference: `order_${Date.now()}_${businessUserId}`,
        notification_url: `${import.meta.env.VITE_APP_URL}/api/payment-webhook`,
        back_urls: {
          success: `${import.meta.env.VITE_APP_URL}/payment/success`,
          failure: `${import.meta.env.VITE_APP_URL}/payment/failure`,
          pending: `${import.meta.env.VITE_APP_URL}/payment/pending`
        },
        auto_return: 'approved',
        expires: true,
        expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        statement_descriptor: businessSettings.business_name || 'Pedinu'
      };

      // Create preference using the business's credentials
      const response = await fetch(`${this.baseUrl}/checkout/preferences`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${businessAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentPreference)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ao criar pagamento: ${errorData.message || 'Erro desconhecido'}`);
      }

      const preference = await response.json();

      // Save payment record to database
      await this.savePaymentRecord({
        preference_id: preference.id,
        business_user_id: businessUserId,
        amount: amount,
        platform_fee: platformFeeAmount,
        business_amount: businessAmount,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        payment_method: paymentMethod,
        items: items,
        status: 'pending'
      });

      return {
        preference_id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
        platform_fee: platformFeeAmount,
        business_amount: businessAmount
      };

    } catch (error) {
      console.error('Erro no MercadoPagoService.createPaymentWithSplit:', error);
      throw error;
    }
  }

  // Save payment record to database
  async savePaymentRecord(paymentData) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          preference_id: paymentData.preference_id,
          business_user_id: paymentData.business_user_id,
          amount: paymentData.amount,
          platform_fee: paymentData.platform_fee,
          business_amount: paymentData.business_amount,
          customer_name: paymentData.customer_name,
          customer_email: paymentData.customer_email,
          customer_phone: paymentData.customer_phone,
          payment_method: paymentData.payment_method,
          items: paymentData.items,
          status: paymentData.status,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar registro de pagamento:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no savePaymentRecord:', error);
      throw error;
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId) {
    try {
      const platformAccessToken = import.meta.env.VITE_MERCADOPAGO_PLATFORM_ACCESS_TOKEN;
      
      const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${platformAccessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar status do pagamento');
      }

      const payment = await response.json();
      return payment;
    } catch (error) {
      console.error('Erro no getPaymentStatus:', error);
      throw error;
    }
  }

  // Update payment status in database
  async updatePaymentStatus(preferenceId, status, paymentId = null) {
    try {
      const updateData = {
        status: status,
        updated_at: new Date().toISOString()
      };

      if (paymentId) {
        updateData.payment_id = paymentId;
      }

      const { data, error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('preference_id', preferenceId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar status do pagamento:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no updatePaymentStatus:', error);
      throw error;
    }
  }

  // Get business payment history
  async getBusinessPayments(businessUserId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('business_user_id', businessUserId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar pagamentos do negócio:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro no getBusinessPayments:', error);
      throw error;
    }
  }

  // Calculate platform statistics
  async getPlatformStats() {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('amount, platform_fee, status, created_at');

      if (error) {
        console.error('Erro ao buscar estatísticas da plataforma:', error);
        throw error;
      }

      const stats = {
        totalRevenue: 0,
        totalPlatformFees: 0,
        totalPayments: data.length,
        successfulPayments: 0,
        pendingPayments: 0,
        failedPayments: 0
      };

      data.forEach(payment => {
        if (payment.status === 'approved') {
          stats.totalRevenue += payment.amount;
          stats.totalPlatformFees += payment.platform_fee;
          stats.successfulPayments++;
        } else if (payment.status === 'pending') {
          stats.pendingPayments++;
        } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
          stats.failedPayments++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Erro no getPlatformStats:', error);
      throw error;
    }
  }
}

export const mercadopagoService = new MercadoPagoService(); 