import React from 'react';
    import { DollarSign } from 'lucide-react';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

    const OrderSettingsSection = ({ formData, onChange }) => (
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Pedido</CardTitle>
          <CardDescription>Defina o valor mínimo para pedidos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minOrderValue">Valor Mínimo do Pedido (R$)</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  id="minOrderValue" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  value={formData.min_order_value} 
                  onChange={(e) => onChange('min_order_value', parseFloat(e.target.value) || 0)} 
                  placeholder="20.00" 
                  className="pl-10 text-sm bg-white border-gray-300" 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );

    export default OrderSettingsSection;