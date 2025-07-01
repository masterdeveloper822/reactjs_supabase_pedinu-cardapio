import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, ShoppingBag, DollarSign, TrendingUp, Search, Phone, MapPin, Calendar, Eye, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const StatCard = ({ title, value, icon: Icon, color, description }) => (
  <Card className="relative overflow-hidden bg-card">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-r ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

function Customers() {
  const { customers, customerOrders, getCustomerStats, loadingData } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const stats = getCustomerStats();

  const filteredCustomers = useMemo(() => 
    customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.neighborhood && customer.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [customers, searchTerm]
  );
  
  const selectedCustomerOrders = useMemo(() => 
    selectedCustomer ? customerOrders.filter(order => order.customer_id === selectedCustomer.id) : [],
    [customerOrders, selectedCustomer]
  );

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total de Clientes', value: stats.totalCustomers, icon: Users, color: 'from-blue-500 to-blue-600', description: 'clientes cadastrados' },
    { title: 'Total de Pedidos', value: customerOrders.length, icon: ShoppingBag, color: 'from-green-500 to-green-600', description: 'pedidos realizados' },
    { title: 'Receita Total', value: formatPrice(customerOrders.reduce((sum, order) => sum + Number(order.total), 0)), icon: DollarSign, color: 'from-purple-500 to-purple-600', description: 'em vendas' },
    { title: 'Ticket Médio', value: formatPrice(customerOrders.length > 0 ? customerOrders.reduce((sum, order) => sum + Number(order.total), 0) / customerOrders.length : 0), icon: TrendingUp, color: 'from-orange-500 to-orange-600', description: 'por pedido' }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie sua base de clientes e histórico de pedidos.
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
           <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
          >
            <StatCard {...stat} />
           </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
        >
          <Card className="h-full bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Lista de Clientes</CardTitle>
              <CardDescription className="text-muted-foreground">
                {filteredCustomers.length} cliente(s) encontrado(s)
              </CardDescription>
              <div className="relative pt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, telefone ou bairro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
            </CardHeader>
            <CardContent className="max-h-[60vh] overflow-y-auto">
              <div className="space-y-3">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <motion.div
                      key={customer.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-accent ${
                        selectedCustomer?.id === customer.id 
                          ? 'bg-red-500/10 border-red-500/50' 
                          : 'border-border bg-background/50 hover:border-primary/20'
                      }`}
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1 overflow-hidden">
                          <h3 className="font-semibold text-foreground truncate">{customer.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{customer.phone}</span>
                          </div>
                          {customer.neighborhood && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{customer.neighborhood}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right pl-2 flex flex-col items-end">
                          <Badge variant="secondary" className="mb-2 whitespace-nowrap">
                            {customer.total_orders} {customer.total_orders === 1 ? 'pedido' : 'pedidos'}
                          </Badge>
                          <div className="text-sm font-bold text-green-600 whitespace-nowrap">
                            {formatPrice(customer.total_spent)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-16">
                    <Info className="h-10 w-10 mx-auto mb-2 text-muted-foreground/70" />
                    <p>{searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}</p>
                    <p className="text-xs">Novos clientes aparecerão aqui.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
        >
          <Card className="h-full bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">
                {selectedCustomer ? `Pedidos de ${selectedCustomer.name.split(' ')[0]}` : 'Histórico de Pedidos'}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {selectedCustomer ? 'Detalhes dos pedidos do cliente selecionado' : 'Selecione um cliente para ver seu histórico'}
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[66vh] overflow-y-auto">
              {selectedCustomer ? (
                selectedCustomerOrders.length > 0 ? (
                  <div className="space-y-4">
                    {selectedCustomerOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-lg border border-border bg-background/50"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground text-sm">
                              {format(new Date(order.order_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            {formatPrice(order.total)}
                          </div>
                        </div>
                        
                        <div className="border-t border-border pt-3">
                          <div className="space-y-2 mb-3">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm text-muted-foreground">
                                <span>{item.quantity}x {item.name}</span>
                                <span>{formatPrice(item.promotional_price || item.price)}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex flex-wrap gap-2 text-xs mt-3">
                            <Badge variant="outline">{order.payment_method}</Badge>
                            {order.customer_neighborhood && <Badge variant="outline">{order.customer_neighborhood}</Badge>}
                            {order.delivery_fee > 0 && <Badge variant="outline">Taxa: {formatPrice(order.delivery_fee)}</Badge>}
                          </div>
                          
                          {order.notes && (
                            <div className="mt-3 p-2 bg-accent/50 rounded text-sm text-foreground/80 border border-border">
                              <strong>Obs:</strong> {order.notes}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                   <div className="text-center text-muted-foreground py-16 h-full flex flex-col justify-center items-center">
                    <ShoppingBag className="h-10 w-10 mx-auto mb-2 text-muted-foreground/70" />
                    <p>Nenhum pedido encontrado para este cliente.</p>
                  </div>
                )
              ) : (
                <div className="text-center py-16 text-muted-foreground h-full flex flex-col justify-center items-center">
                  <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="font-medium">Selecione um cliente ao lado</p>
                  <p className="text-sm">para visualizar seus pedidos em detalhes.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default Customers;