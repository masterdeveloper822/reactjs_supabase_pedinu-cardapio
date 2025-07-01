import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Wallet,
  Download,
  Calendar,
  AlertCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

function FinancialPage() {
  const { toast } = useToast();
  const [balance] = useState(0); // Zerado
  const [pendingWithdrawal] = useState(0); // Zerado

  const transactions = []; // Zerado

  const stats = [
    {
      title: 'Saldo Disponível',
      value: balance,
      icon: Wallet,
      color: 'from-green-500 to-green-600',
      change: '' // Removido valor fake
    },
    {
      title: 'Vendas do Mês',
      value: 0, // Zerado
      icon: TrendingUp,
      color: 'from-red-500 to-red-600',
      change: '' // Removido valor fake
    },
    {
      title: 'Taxas Pagas',
      value: 0, // Zerado
      icon: CreditCard,
      color: 'from-orange-500 to-orange-600',
      change: '' // Removido valor fake
    },
    {
      title: 'Saques Pendentes',
      value: pendingWithdrawal,
      icon: Download,
      color: 'from-pink-500 to-pink-600',
      change: '' // Removido valor fake
    }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(value));
  };

  const handleWithdrawal = () => {
    if (balance < 50) {
      toast({
        title: "Saldo insuficiente",
        description: "O valor mínimo para saque é R$ 50,00",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "🚧 Solicitar Saque",
      description: "Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀"
    });
  };

  const handleExportReport = () => {
    toast({
      title: "🚧 Exportar Relatório",
      description: "Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas vendas, taxas e saques
          </p>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleExportReport} className="hover:bg-red-50 hover:border-red-300">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button 
            className="bg-gradient-to-r from-green-500 to-green-600"
            onClick={handleWithdrawal}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Solicitar Saque
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(stat.value)}
                      </p>
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

      {/* Fee Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Informações sobre Taxas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-red-800">
              <div>
                <h4 className="font-semibold mb-2">Taxa de Transação</h4>
                <p>• 5% sobre cada venda realizada</p>
                <p>• Descontada automaticamente</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Taxa de Saque</h4>
                <p>• R$ 5,00 por saque solicitado</p>
                <p>• Valor mínimo: R$ 50,00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
            <CardDescription>Últimas movimentações financeiras</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'sale' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'sale' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                      </p>
                      {transaction.fee > 0 && (
                        <p className="text-xs text-gray-500">
                          Taxa: {formatCurrency(transaction.fee)}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Líquido: {formatCurrency(transaction.net)}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status === 'completed' ? 'Concluído' : 'Processando'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Info className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                <p>Nenhuma transação registrada.</p>
                <p className="text-xs">As novas transações aparecerão aqui.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Withdrawal Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Como Funciona o Saque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <p>Solicite o saque quando tiver pelo menos R$ 50,00 disponível</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <p>Uma taxa de R$ 5,00 será descontada do valor solicitado</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <p>O valor será transferido para sua conta em até 2 dias úteis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default FinancialPage;