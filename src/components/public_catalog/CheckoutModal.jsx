import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, User, Phone, CreditCard, MessageSquare, ShoppingCart, Search, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatPrice } from '@/lib/utils';
import { mercadopagoService } from '@/lib/mercadopagoService';
import { toast } from '@/components/ui/use-toast';

const CheckoutModal = ({ 
  isOpen, 
  onClose, 
  cart, 
  total, 
  deliveryZones, 
  onConfirm, 
  businessName,
  whatsappNumber,
  isProcessingOrder = false,
  businessData
}) => {
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    neighborhood: '',
    address: '',
    paymentMethod: '',
    notes: ''
  });
  
  const [selectedZone, setSelectedZone] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [errors, setErrors] = useState({});
  const [neighborhoodSearch, setNeighborhoodSearch] = useState('');
  const [showNeighborhoodDropdown, setShowNeighborhoodDropdown] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);

  const filteredZones = deliveryZones.filter(zone => {
    if (!neighborhoodSearch.trim()) return true;
    return zone.neighborhood_name.toLowerCase().includes(neighborhoodSearch.toLowerCase().trim());
  });

  useEffect(() => {
    if (customerData.neighborhood && deliveryZones.length > 0) {
      const zone = deliveryZones.find(z => z.neighborhood_name === customerData.neighborhood);
      if (zone) {
        setSelectedZone(zone);
        setDeliveryFee(Number(zone.fee) || 0);
      } else {
        setSelectedZone(null);
        setDeliveryFee(0);
      }
    }
  }, [customerData.neighborhood, deliveryZones]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!customerData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!customerData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (!customerData.neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório';
    if (!customerData.address.trim()) newErrors.address = 'Endereço é obrigatório';
    if (!customerData.paymentMethod) newErrors.paymentMethod = 'Forma de pagamento é obrigatória';
    
    if (customerData.neighborhood && !selectedZone) {
      newErrors.neighborhood = 'Selecione um bairro válido da lista';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm() && !isProcessingOrder && !isProcessingPayment) {
      
      // Check if it's a Mercado Pago payment method
      const isMercadoPagoPayment = customerData.paymentMethod === 'Pix' || 
                                  customerData.paymentMethod === 'Cartão de Crédito' || 
                                  customerData.paymentMethod === 'Cartão de Débito';
      
      if (isMercadoPagoPayment) {
        await handleMercadoPagoPayment();
      } else {
        // Traditional WhatsApp order
        onConfirm(customerData, deliveryFee);
        resetForm();
        onClose();
      }
    }
  };

  const handleMercadoPagoPayment = async () => {
    try {
      setIsProcessingPayment(true);
      
      const paymentData = {
        amount: finalTotal,
        description: `Pedido - ${businessName}`,
        customerEmail: `${customerData.name.toLowerCase().replace(/\s+/g, '.')}@pedinu.com`, // Generate email if not provided
        customerName: customerData.name,
        customerPhone: customerData.phone,
        paymentMethod: customerData.paymentMethod,
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: (item.promotional_price || item.price) * item.quantity
        })),
        businessUserId: businessData?.businessUserId || 'unknown'
      };

      const businessSettings = businessData.settings;

      const paymentResult = await mercadopagoService.createPaymentWithSplit(paymentData, businessSettings);
      
      // Store payment URL for redirect
      setPaymentUrl(paymentResult.init_point || paymentResult.sandbox_init_point);
      
      // Show success message
      toast({
        title: "Pagamento Criado!",
        description: `Redirecionando para o Mercado Pago...`,
        variant: "default"
      });

      // Redirect to Mercado Pago
      setTimeout(() => {
        window.open(paymentResult.init_point || paymentResult.sandbox_init_point, '_blank');
      }, 1000);

    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        title: "Erro no Pagamento",
        description: error.message || "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const resetForm = () => {
    setCustomerData({
      name: '',
      phone: '',
      neighborhood: '',
      address: '',
      paymentMethod: '',
      notes: ''
    });
    setSelectedZone(null);
    setDeliveryFee(0);
    setNeighborhoodSearch('');
    setPaymentUrl(null);
  };

  const handleNeighborhoodSelect = (zoneName, zoneFee) => {
    setCustomerData(prev => ({ ...prev, neighborhood: zoneName }));
    setNeighborhoodSearch(zoneName);
    setShowNeighborhoodDropdown(false);
    setDeliveryFee(Number(zoneFee) || 0);
  };

  const handleNeighborhoodInputChange = (value) => {
    setNeighborhoodSearch(value);
    setCustomerData(prev => ({ ...prev, neighborhood: value }));
    setShowNeighborhoodDropdown(true);
    
    const exactMatch = deliveryZones.find(zone => 
      zone.neighborhood_name.toLowerCase() === value.toLowerCase()
    );
    if (!exactMatch) {
      setSelectedZone(null);
      setDeliveryFee(0);
    }
  };

  if (!isOpen) return null;

  const finalTotal = total + deliveryFee;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              disabled={isProcessingOrder}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-6 w-6" />
              <div>
                <h2 className="text-2xl font-bold">Finalizar Pedido</h2>
                <p className="text-red-100">{businessName}</p>
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center space-x-2 text-gray-700 font-medium">
                    <User className="h-4 w-4 text-red-500" />
                    <span>Nome Completo *</span>
                  </Label>
                  <Input
                    id="name"
                    value={customerData.name}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                    className={`border-2 focus:border-red-500 focus:ring-red-500 ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                    placeholder="Seu nome completo"
                    disabled={isProcessingOrder}
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center space-x-2 text-gray-700 font-medium">
                    <Phone className="h-4 w-4 text-red-500" />
                    <span>Telefone *</span>
                  </Label>
                  <Input
                    id="phone"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                    className={`border-2 focus:border-red-500 focus:ring-red-500 ${errors.phone ? 'border-red-300' : 'border-gray-200'}`}
                    placeholder="(11) 99999-9999"
                    disabled={isProcessingOrder}
                  />
                  {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood" className="flex items-center space-x-2 text-gray-700 font-medium">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span>Bairro *</span>
                </Label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="neighborhood"
                      value={neighborhoodSearch}
                      onChange={(e) => handleNeighborhoodInputChange(e.target.value)}
                      onFocus={() => setShowNeighborhoodDropdown(true)}
                      className={`pl-10 border-2 focus:border-red-500 focus:ring-red-500 ${errors.neighborhood ? 'border-red-300' : 'border-gray-200'}`}
                      placeholder="Digite para pesquisar seu bairro..."
                      disabled={isProcessingOrder}
                    />
                  </div>
                  
                  {showNeighborhoodDropdown && filteredZones.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredZones.map((zone) => (
                        <button
                          key={zone.id}
                          type="button"
                          onClick={() => handleNeighborhoodSelect(zone.neighborhood_name, zone.fee)}
                          className="w-full px-4 py-3 text-left hover:bg-red-50 border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                          disabled={isProcessingOrder}
                        >
                          <span className="font-medium text-gray-800">{zone.neighborhood_name}</span>
                          <span className="text-sm text-red-600 font-semibold">
                            Taxa: {formatPrice(zone.fee)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {showNeighborhoodDropdown && neighborhoodSearch && filteredZones.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                      Nenhum bairro encontrado
                    </div>
                  )}
                </div>
                {errors.neighborhood && <p className="text-red-500 text-sm">{errors.neighborhood}</p>}
                {selectedZone && (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Taxa de entrega: {formatPrice(selectedZone.fee)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center space-x-2 text-gray-700 font-medium">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span>Endereço Completo *</span>
                </Label>
                <Input
                  id="address"
                  value={customerData.address}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
                  className={`border-2 focus:border-red-500 focus:ring-red-500 ${errors.address ? 'border-red-300' : 'border-gray-200'}`}
                  placeholder="Rua, número, complemento..."
                  disabled={isProcessingOrder}
                />
                {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="flex items-center space-x-2 text-gray-700 font-medium">
                  <CreditCard className="h-4 w-4 text-red-500" />
                  <span>Forma de Pagamento *</span>
                </Label>
                <Select
                  value={customerData.paymentMethod || undefined}
                  onValueChange={(value) => {
                    if (value) {
                      setCustomerData(prev => ({ ...prev, paymentMethod: value }));
                    }
                  }}
                  disabled={isProcessingOrder}
                >
                  <SelectTrigger className={`border-2 focus:border-red-500 focus:ring-red-500 ${errors.paymentMethod ? 'border-red-300' : 'border-gray-200'}`}>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pix">Pix</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                    <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentMethod && <p className="text-red-500 text-sm">{errors.paymentMethod}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center space-x-2 text-gray-700 font-medium">
                  <MessageSquare className="h-4 w-4 text-red-500" />
                  <span>Observações</span>
                </Label>
                <Textarea
                  id="notes"
                  value={customerData.notes}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, notes: e.target.value }))}
                  className="border-2 border-gray-200 focus:border-red-500 focus:ring-red-500 resize-none"
                  placeholder="Alguma observação especial? (opcional)"
                  rows={3}
                  disabled={isProcessingOrder}
                />
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-4">Resumo do Pedido</h3>
                <div className="space-y-3">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <span className="text-gray-700">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {formatPrice((item.promotional_price || item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2 text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-gray-600">
                    <span>Taxa de entrega:</span>
                    <span className="font-semibold">{formatPrice(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 text-xl font-bold text-red-600 border-t-2 border-red-200">
                    <span>Total:</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isProcessingOrder || isProcessingPayment}
              >
                {isProcessingOrder ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processando...</span>
                  </div>
                ) : isProcessingPayment ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Criando Pagamento...</span>
                  </div>
                ) : customerData.paymentMethod === 'Pix' || 
                    customerData.paymentMethod === 'Cartão de Crédito' || 
                    customerData.paymentMethod === 'Cartão de Débito' ? (
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Pagar com Mercado Pago - {formatPrice(finalTotal)}</span>
                  </div>
                ) : (
                  `Enviar Pedido via WhatsApp - ${formatPrice(finalTotal)}`
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CheckoutModal;