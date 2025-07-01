import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

const AdminSettingsPage = () => {
  const { toast } = useToast();
  
  const handleNotImplemented = (feature) => {
    toast({
      title: `🚧 ${feature || 'Funcionalidade'} não implementada`,
      description: "Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀",
    });
  };

  return (
    <div className="space-y-6">
      <motion.div 
        className="flex items-center space-x-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Settings className="h-8 w-8 text-gray-800" />
        <h1 className="text-3xl font-bold text-gray-800">Configurações do Painel</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800"><Bell className="mr-2 h-5 w-5" /> Notificações</CardTitle>
            <CardDescription>Gerencie suas preferências de notificação.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="text-gray-800">Notificações por E-mail</Label>
              <Switch id="email-notifications" defaultChecked onClick={() => handleNotImplemented('Notificações por E-mail')} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications" className="text-gray-800">Notificações Push (Desktop)</Label>
              <Switch id="push-notifications" onClick={() => handleNotImplemented('Notificações Push')} />
            </div>
             <Button variant="link" className="text-red-500 p-0 h-auto" onClick={() => handleNotImplemented('Configurações Avançadas de Notificação')}>
                Configurações Avançadas de Notificação
              </Button>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-white shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800"><Shield className="mr-2 h-5 w-5" /> Segurança</CardTitle>
            <CardDescription>Gerencie as configurações de segurança da sua conta de administrador.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full md:w-auto bg-white border-gray-300" onClick={() => handleNotImplemented('Alterar Senha')}>
              Alterar Senha de Administrador
            </Button>
            <div className="flex items-center justify-between">
              <Label htmlFor="2fa" className="text-gray-800">Autenticação de Dois Fatores (2FA)</Label>
              <Switch id="2fa" onClick={() => handleNotImplemented('2FA')} />
            </div>
            <Button variant="link" className="text-red-500 p-0 h-auto" onClick={() => handleNotImplemented('Ver Histórico de Login')}>
                Ver Histórico de Login
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminSettingsPage;