import { useState, useCallback, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';

export const useCart = (businessData, toast) => {
  const [cart, setCart] = useState([]);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const { saveCustomerOrder, addKitchenOrder } = useData();
  const { user } = useAuth();

  const addToCart = useCallback((product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prevCart.filter(item => item.id !== productId);
      }
    });
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = item.promotional_price || item.price;
      return total + (Number(price) * item.quantity);
    }, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }, [cart]);

  const mapPaymentMethod = (paymentMethod) => {
    const paymentMap = {
      'Pix': 'pix',
      'Dinheiro': 'cash',
      'Cartão de Crédito': 'credit_card',
      'Cartão de Débito': 'debit_card'
    };
    return paymentMap[paymentMethod] || 'cash';
  };

  const handleWhatsAppOrder = useCallback(async (customerDetails, deliveryFee) => {
    if (!businessData || cart.length === 0 || isProcessingOrder) {
      if (isProcessingOrder) {
        toast({
          title: "Processando...",
          description: "Aguarde, seu pedido está sendo processado.",
          variant: "default"
        });
      }
      return;
    }

    setIsProcessingOrder(true);

    const subtotal = cartTotal;
    const total = subtotal + deliveryFee;
    const orderTimestamp = new Date().toISOString();

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('business_slug', businessData.businessSlug)
        .single();

      if (profileError) {
        throw new Error('Erro ao buscar dados do estabelecimento');
      }

      if (!profileData) {
        throw new Error('Estabelecimento não encontrado');
      }

      const mappedPaymentMethod = mapPaymentMethod(customerDetails.paymentMethod);
      const orderItems = cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.promotional_price || item.price
      }));

      const kitchenOrderData = {
        user_id: profileData.id,
        customer_name: customerDetails.name,
        items: orderItems,
        total: total,
        status: 'received',
        order_time: orderTimestamp,
        order_type: 'delivery',
        payment_method: mappedPaymentMethod,
        delivery_address: `${customerDetails.address}, ${customerDetails.neighborhood}`,
        notes: customerDetails.notes || null
      };

      const { data: kitchenOrder, error: kitchenError } = await supabase
        .from('kitchen_orders')
        .insert(kitchenOrderData)
        .select()
        .single();

      if (kitchenError) {
        console.error('Erro detalhado do Supabase:', kitchenError);
        if (kitchenError.code === '23502') {
          throw new Error('Dados obrigatórios não fornecidos para o pedido');
        } else if (kitchenError.code === '23503') {
          throw new Error('Referência inválida nos dados do pedido');
        } else if (kitchenError.code === '42501') {
          throw new Error('Permissão negada para salvar o pedido');
        } else {
          throw new Error(`Erro no banco de dados: ${kitchenError.message}`);
        }
      }

      if (!kitchenOrder) {
        throw new Error('Falha ao criar pedido no sistema');
      }

      if (user && saveCustomerOrder) {
        try {
          await saveCustomerOrder(user.id, customerDetails, cart, subtotal, deliveryFee, total);
        } catch (customerError) {
          console.warn('Aviso: Erro ao salvar dados do cliente:', customerError);
        }
      }

      const whatsappNumber = (businessData.settings.whatsapp || businessData.settings.phone || '').replace(/\D/g, '');
      
      if (!whatsappNumber) {
        toast({
          title: "Erro",
          description: "Número do WhatsApp não configurado.",
          variant: "destructive"
        });
        return;
      }

      let message = `🛍️ *NOVO PEDIDO - ${businessData.businessName}*\n\n`;
      message += `👤 *Cliente:* ${customerDetails.name}\n`;
      message += `📱 *Telefone:* ${customerDetails.phone}\n`;
      message += `📍 *Bairro:* ${customerDetails.neighborhood}\n`;
      message += `🏠 *Endereço:* ${customerDetails.address}\n`;
      message += `💳 *Pagamento:* ${customerDetails.paymentMethod}\n\n`;

      message += `📋 *ITENS DO PEDIDO:*\n`;
      cart.forEach(item => {
        const price = item.promotional_price || item.price;
        message += `• ${item.quantity}x ${item.name} - R$ ${Number(price).toFixed(2).replace('.', ',')}\n`;
      });

      message += `\n💰 *RESUMO:*\n`;
      message += `Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
      message += `Taxa de entrega: R$ ${deliveryFee.toFixed(2).replace('.', ',')}\n`;
      message += `*Total: R$ ${total.toFixed(2).replace('.', ',')}*\n`;

      if (customerDetails.notes) {
        message += `\n📝 *Observações:* ${customerDetails.notes}`;
      }

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/55${whatsappNumber}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
      
      setCart([]);
      
      toast({
        title: "Pedido enviado!",
        description: `Pedido #${kitchenOrder.id.slice(-4)} foi enviado via WhatsApp e registrado no sistema!`
      });

    } catch (error) {
      console.error('Erro completo ao processar pedido:', error);
      toast({
        title: "Erro ao processar pedido",
        description: error.message || "Ocorreu um erro ao processar o pedido. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingOrder(false);
    }
  }, [businessData, cart, cartTotal, toast, user, saveCustomerOrder, isProcessingOrder]);

  return {
    cart,
    addToCart,
    removeFromCart,
    cartTotal,
    cartItemCount,
    handleWhatsAppOrder,
    isProcessingOrder
  };
};