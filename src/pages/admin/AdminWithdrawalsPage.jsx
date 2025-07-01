import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Search, CheckCircle, XCircle, Filter, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// Mock data
const mockWithdrawals = [
  { id: 'wd001', userId: 'user1', userName: 'Pizzaria Sabor da Itália', amount: 500.00, date: '2024-06-10T10:00:00Z', status: 'pending', bankInfo: 'Banco XYZ, Ag: 0001, CC: 12345-6' },
  { id: 'wd002', userId: 'user2', userName: 'Hamburgueria do Zé', amount: 250.50, date: '2024-06-09T15:30:00Z', status: 'approved', bankInfo: 'Banco ABC, Ag: 0002, CC: 65432-1' },
  { id: 'wd003', userId: 'user3', userName: 'Sushi Imperial', amount: 1200.00, date: '2024-06-08T09:15:00Z', status: 'rejected', reason: 'Dados bancários inválidos', bankInfo: 'Banco DEF, Ag: 0003, CC: 98765-4' },
  { id: 'wd004', userId: 'user4', userName: 'Padaria Pão Quente', amount: 150.75, date: '2024-06-11T11:00:00Z', status: 'pending', bankInfo: 'Banco GHI, Ag: 0004, CC: 11223-3' },
];

const AdminWithdrawalsPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [withdrawals, setWithdrawals] = useState(mockWithdrawals);

  const handleNotImplemented = (feature) => {
    toast({
      title: `🚧 ${feature || 'Funcionalidade'} não implementada`,
      description: "Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀",
    });
  };

  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter(w => {
      const matchesSearch = w.userName.toLowerCase().includes(searchTerm.toLowerCase()) || w.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || w.status === filterStatus;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by most recent
  }, [withdrawals, searchTerm, filterStatus]);

  const updateWithdrawalStatus = (id, newStatus, reason = '') => {
    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: newStatus, reason: newStatus === 'rejected' ? reason : '' } : w));
    toast({
      title: `Saque ${newStatus === 'approved' ? 'Aprovado' : 'Rejeitado'}`,
      description: `O saque ID ${id} foi atualizado.`,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">Pendente</Badge>;
      case 'approved': return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">Aprovado</Badge>;
      case 'rejected': return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">Rejeitado</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        className="flex flex-col md:flex-row md:items-center md:justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-2">
          <DollarSign className="h-8 w-8 admin-text" />
          <h1 className="text-3xl font-bold admin-text">Solicitações de Saque</h1>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="admin-card shadow-lg">
          <CardHeader>
            <CardTitle className="admin-text">Gerenciar Saques</CardTitle>
            <CardDescription>Aprove ou rejeite solicitações de saque dos usuários.</CardDescription>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome do usuário ou ID..."
                  className="pl-10 admin-input w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="admin-input rounded-md p-2 text-sm"
                >
                  <option value="all">Todos Status</option>
                  <option value="pending">Pendentes</option>
                  <option value="approved">Aprovados</option>
                  <option value="rejected">Rejeitados</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Saque</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWithdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id} className="hover:bg-muted/20">
                    <TableCell className="font-mono text-xs">{withdrawal.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{withdrawal.userName}</div>
                      <div className="text-xs text-muted-foreground">{withdrawal.bankInfo}</div>
                    </TableCell>
                    <TableCell className="text-right">{formatPrice(withdrawal.amount)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        {new Date(withdrawal.date).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-muted-foreground ml-5">
                        {new Date(withdrawal.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                    <TableCell className="text-center space-x-1">
                      {withdrawal.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-700" onClick={() => updateWithdrawalStatus(withdrawal.id, 'approved')}>
                            <CheckCircle className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => {
                            const reason = prompt("Motivo da rejeição (opcional):");
                            updateWithdrawalStatus(withdrawal.id, 'rejected', reason || 'Não especificado');
                          }}>
                            <XCircle className="h-5 w-5" />
                          </Button>
                        </>
                      )}
                      {withdrawal.status !== 'pending' && (
                        <Button variant="ghost" size="sm" onClick={() => handleNotImplemented('Ver Detalhes')}>Detalhes</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredWithdrawals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhuma solicitação de saque encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
             {/* Paginação (simulada) */}
             <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNotImplemented('Paginação')}
                disabled={true}
                className="admin-input"
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNotImplemented('Paginação')}
                className="admin-input"
              >
                Próximo
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminWithdrawalsPage;