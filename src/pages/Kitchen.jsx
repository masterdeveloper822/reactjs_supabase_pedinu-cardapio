import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, CheckCircle, ShoppingBag, Utensils, Bell, ArrowRight, Printer, XCircle, ChevronDown, ChevronUp, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { formatPrice } from '@/lib/utils';
import { useData } from '@/contexts/DataContext';

const orderStatusConfig = {
  received: { 
    title: 'Em análise', 
    icon: Bell, 
    bgColor: 'bg-red-500', 
    textColor: 'text-white',
    borderColor: 'border-red-400', 
    next: 'preparing', 
    prev: null 
  },
  preparing: { 
    title: 'Em produção', 
    icon: Utensils, 
    bgColor: 'bg-orange-500', 
    textColor: 'text-white',
    borderColor: 'border-orange-400', 
    next: 'ready', 
    prev: 'received' 
  },
  ready: { 
    title: 'Prontos para entrega', 
    icon: CheckCircle, 
    bgColor: 'bg-green-500', 
    textColor: 'text-white',
    borderColor: 'border-green-400', 
    next: 'completed', 
    prev: 'preparing' 
  },
  completed: { 
    title: 'Finalizados', 
    icon: ShoppingBag, 
    bgColor: 'bg-gray-400', 
    textColor: 'text-white',
    borderColor: 'border-gray-400', 
    next: null, 
    prev: 'ready' 
  },
};

const OrderCard = ({ order, onUpdateStatus, onCancelOrder }) => {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);

  const timeSinceOrder = Math.round((new Date() - new Date(order.order_time)) / 60000);
  const statusInfo = orderStatusConfig[order.status];

  if (!statusInfo) {
    console.error("Status de pedido inválido:", order.status, order);
    return <Card className="mb-2 p-2 bg-red-100 text-red-700 border border-red-300 rounded-lg text-xs">Erro: Status de pedido desconhecido.</Card>;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="mb-2"
    >
      <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <CardHeader className="p-2 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-xs font-semibold text-gray-900 truncate">#{order.id.slice(-4)}</CardTitle>
              <CardDescription className="text-xs text-gray-600 truncate">{order.customer_name}</CardDescription>
            </div>
            <div className="flex items-center text-xs text-gray-500 ml-2 flex-shrink-0">
              <Clock className="h-3 w-3 mr-1" />
              <span>{timeSinceOrder}min</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-2">
          <div className="mb-2">
            <div className="text-xs text-gray-600 mb-1">Itens:</div>
            <div className="text-xs text-gray-800 space-y-0.5 max-h-16 overflow-y-auto custom-scrollbar-sm">
              {order.items.slice(0, expanded ? order.items.length : 2).map((item, index) => (
                <div key={`${item.name}-${index}`} className="truncate">
                  <span className="font-medium">{item.quantity}x</span> <span className="text-gray-700">{item.name}</span>
                </div>
              ))}
            </div>
            {order.items.length > 2 && (
              <Button 
                variant="link" 
                size="sm" 
                className="text-xs h-auto p-0 mt-1 text-blue-600 hover:text-blue-700" 
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Menos' : `+${order.items.length - 2}`}
              </Button>
            )}
          </div>
          
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tipo:</span>
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${order.order_type === 'delivery' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                {order.order_type === 'delivery' ? 'Entrega' : 'Retirada'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pagamento:</span>
              <span className="text-gray-800 capitalize text-xs">{order.payment_method}</span>
            </div>
          </div>
          
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="text-sm font-bold text-gray-900 text-center">{formatPrice(order.total)}</div>
          </div>
        </CardContent>
        
        <CardFooter className="p-2 border-t border-gray-100 space-y-1.5">
          {statusInfo.next && (
            <Button
              className="w-full h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium"
              onClick={() => onUpdateStatus(order.id, statusInfo.next)}
            >
              Avançar
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
          
          <div className="flex space-x-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-6 text-xs border-gray-300 px-1" 
              onClick={() => toast({ title: "🚧 Impressão em breve!", description: "Esta funcionalidade ainda não foi implementada."})}
            >
              <Printer className="h-3 w-3" />
            </Button>
            {order.status !== 'completed' && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-6 text-xs text-red-600 border-red-300 hover:bg-red-50 px-1" 
                onClick={() => onCancelOrder(order.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

function Kitchen() {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { businessSettings, getKitchenOrders, updateKitchenOrderStatus, cancelKitchenOrder, addKitchenOrder } = useData(); 

  const refreshOrders = useCallback(() => {
    const loadedOrders = getKitchenOrders();
    setOrders(loadedOrders);
  }, [getKitchenOrders]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const handleUpdateStatus = (orderId, newStatus) => {
    updateKitchenOrderStatus(orderId, newStatus);
    refreshOrders();
    toast({
      title: "Status Atualizado!",
      description: `Pedido #${orderId.slice(-4)} movido para ${orderStatusConfig[newStatus].title}.`
    });
  };
  
  const handleCancelOrder = (orderId) => {
    cancelKitchenOrder(orderId);
    refreshOrders();
    toast({
      title: "Pedido Cancelado!",
      description: `Pedido #${orderId.slice(-4)} foi cancelado.`,
      variant: "destructive"
    });
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (businessSettings && businessSettings.is_open && Math.random() < 0.15) { 
        const newOrderId = `KORD${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;
        const sampleItems = [
            { name: 'Pizza Calabresa', quantity: Math.floor(Math.random() * 2) + 1 },
            { name: 'X-Tudo', quantity: Math.floor(Math.random() * 1) + 1 },
            { name: 'Açaí 500ml', quantity: Math.floor(Math.random() * 2) + 1 },
            { name: 'Refrigerante 2L', quantity: 1 },
        ];
        const numItems = Math.floor(Math.random() * 2) + 1;
        const currentItems = [];
        for(let i=0; i<numItems; i++){
            currentItems.push(sampleItems[Math.floor(Math.random() * sampleItems.length)]);
        }

        const newOrder = {
          id: newOrderId,
          customer_name: ['Roberto Alves', 'Fernanda Costa', 'Lucas Martins', 'Beatriz Santos'][Math.floor(Math.random() * 4)],
          items: currentItems,
          total: Math.floor(Math.random() * 80) + 20,
          status: 'received',
          order_time: new Date().toISOString(),
          order_type: Math.random() > 0.5 ? 'delivery' : 'pickup',
          delivery_address: 'Rua Exemplo, ' + (Math.floor(Math.random() * 1000) + 1),
          payment_method: ['pix', 'credit_card', 'cash'][Math.floor(Math.random()*3)]
        };
        addKitchenOrder(newOrder); 
        refreshOrders();
        toast({
          title: "🎉 Novo Pedido Recebido!",
          description: `Pedido #${newOrderId.slice(-4)} de ${newOrder.customer_name}.`,
        });
      }
    }, 25000); 
    return () => clearInterval(interval);
  }, [businessSettings, toast, addKitchenOrder, refreshOrders]);

  if (!businessSettings) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-50">
        <AlertTriangle className="h-16 w-16 text-orange-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Carregando Configurações...</h2>
        <p className="text-gray-500">Aguarde um momento enquanto buscamos os dados do seu estabelecimento.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">Meus Pedidos</h1>
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${businessSettings.is_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {businessSettings.is_open ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <span>{businessSettings.is_open ? 'Estabelecimento Aberto' : 'Estabelecimento Fechado'}</span>
          </div>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar pelo cliente"
            className="pl-10 h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-3 overflow-y-auto">
        {Object.keys(orderStatusConfig).map(statusKey => {
          const config = orderStatusConfig[statusKey];
          const ordersInStatus = filteredOrders.filter(order => order.status === statusKey);
          return (
            <motion.div
              key={statusKey}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * Object.keys(orderStatusConfig).indexOf(statusKey) }}
              className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
              style={{ minHeight: '600px', maxHeight: 'calc(100vh - 140px)' }}
            >
              <div className={`${config.bgColor} ${config.textColor} p-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <config.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <h2 className="text-sm font-semibold truncate">{config.title}</h2>
                  </div>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium min-w-[1.5rem] text-center flex-shrink-0 ml-2">
                    {ordersInStatus.length}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 p-2 overflow-y-auto bg-gray-50 custom-scrollbar-sm">
                <AnimatePresence>
                  {ordersInStatus.length > 0 ? (
                    ordersInStatus.map(order => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={handleUpdateStatus}
                        onCancelOrder={handleCancelOrder}
                      />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-gray-400 py-8 flex flex-col items-center justify-center h-full"
                    >
                      <config.icon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-xs font-medium">Nenhum pedido</p>
                      <p className="text-xs text-gray-400 mt-1">nesta etapa</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default Kitchen;