import React from 'react';
import { Eye, Link, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DigitalMenuLinkSection = ({ businessSlug, onView, onShare }) => (
  <Card>
    <CardHeader>
      <CardTitle>Link do seu Cardápio</CardTitle>
      <CardDescription>Compartilhe este link com seus clientes para que eles possam ver seu cardápio e fazer pedidos.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
        <div className="relative flex-1">
          <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={businessSlug ? `${window.location.origin}/cardapio/${businessSlug}` : "Carregando link..."}
            readOnly
            className="flex-1 text-sm bg-gray-50 border-gray-300 pl-10"
          />
        </div>
        <div className="flex space-x-2">
          <Button onClick={onShare} className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm">
            <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />Copiar
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default DigitalMenuLinkSection;