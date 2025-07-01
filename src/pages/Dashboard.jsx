import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Package, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShoppingCart,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import BusinessStatusToggle from '@/components/dashboard/BusinessStatusToggle';

function Dashboard() {
  const { products, categories, businessSettings, updateBusinessSettings } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  const stats = [
    {
      title: 'Total de Produtos',
      value: products.length,
      icon: Package,
      color: 'from-red-500 to-red-600',
      change: '' 
    },
    {
      title: 'Categorias',
      value: categories.length,
      icon: Eye, 
      color: 'from-green-500 to-green-600',
      change: '' 
    },
    {
      title: 'Visualizações',
      value: 0, 
      icon: TrendingUp, 
      color: 'from-pink-500 to-pink-600',
      change: '' 
    },
    {
      title: 'Pedidos Hoje',
      value: 0, 
      icon: ShoppingCart,
      color: 'from-orange-500 to-orange-600',
      change: '' 
    }
  ];

  const recentActivity = []; 

  const handleViewDigitalMenu = () => {
    if (!user?.business_slug) {
      toast({
        title: "Configuração Pendente",
        description: "O slug do seu negócio ainda não foi configurado.",
        variant: "destructive"
      });
      return;
    }
    const digitalMenuUrl = `${window.location.origin}/cardapio/${user.business_slug}`;
    window.open(digitalMenuUrl, '_blank');
  };
  
  const handleQuickAction = (action) => {
    toast({
      title: `🚧 ${action}`,
      description: "Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀",
    });
  };

  const handleToggleBusinessStatus = async () => {
    if (!businessSettings) return;
    setIsStatusLoading(true);
    const newStatus = !businessSettings.is_open;
    try {
      await updateBusinessSettings({ is_open: newStatus });
      toast({ 
        title: newStatus ? "Estabelecimento Aberto!" : "Estabelecimento Fechado!", 
        description: newStatus ? "Agora você está recebendo pedidos." : "Pedidos foram pausados.",
        variant: newStatus ? "default" : "destructive",
        className: newStatus ? "bg-green-500 text-white" : "bg-red-500 text-white"
      });
    } catch (error) {
      toast({
        title: "Erro ao Atualizar Status",
        description: "Não foi possível alterar o status do estabelecimento.",
        variant: "destructive"
      });
    } finally {
      setIsStatusLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo de volta, {user?.business_name || user?.name || 'Usuário'}!
          </p>
        </div>
      </motion.div>

      {businessSettings && (
        <BusinessStatusToggle 
          isOpen={businessSettings.is_open}
          onToggleStatus={handleToggleBusinessStatus}
          isLoading={isStatusLoading}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="relative overflow-hidden bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      {stat.change && <p className="text-sm text-green-600 font-medium">{stat.change}</p>}
                    </div>
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Atividade Recente</CardTitle>
              <CardDescription className="text-muted-foreground">Últimas ações no seu cardápio digital</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="p-2 bg-muted/50 rounded-lg">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Info className="h-10 w-10 mx-auto mb-2 text-muted-foreground/70" />
                  <p>Nenhuma atividade recente para mostrar.</p>
                  <p className="text-xs">As novas atividades aparecerão aqui.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Ações Rápidas</CardTitle>
              <CardDescription className="text-muted-foreground">Gerencie seu cardápio rapidamente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-20 flex-col border-border hover:bg-accent hover:border-primary/50" onClick={() => handleQuickAction('Novo Produto')}>
                  <Package className="h-6 w-6 mb-2 text-primary" />
                  <span className="text-sm text-foreground">Novo Produto</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col border-border hover:bg-accent hover:border-primary/50" onClick={handleViewDigitalMenu}>
                  <Eye className="h-6 w-6 mb-2 text-primary" />
                  <span className="text-sm text-foreground">Ver Cardápio</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col border-border hover:bg-accent hover:border-primary/50" onClick={() => handleQuickAction('Clientes')}>
                  <Users className="h-6 w-6 mb-2 text-primary" />
                  <span className="text-sm text-foreground">Clientes</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col border-border hover:bg-accent hover:border-primary/50" onClick={() => handleQuickAction('Financeiro')}>
                  <DollarSign className="h-6 w-6 mb-2 text-primary" />
                  <span className="text-sm text-foreground">Financeiro</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;