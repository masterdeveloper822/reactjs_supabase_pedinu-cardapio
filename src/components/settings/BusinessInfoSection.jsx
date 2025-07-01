import React from 'react';
import { MapPin, Phone, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const BusinessInfoSection = ({ formData, onChange }) => (
  <Card>
    <CardHeader>
      <CardTitle>Informações do Negócio</CardTitle>
      <CardDescription>Configure os detalhes de contato e descrição.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label htmlFor="description">Descrição Curta</Label>
        <Textarea 
          id="description" 
          value={formData.description} 
          onChange={(e) => onChange('description', e.target.value)} 
          placeholder="Ex: A melhor pizza da cidade!" 
          rows={3} 
          className="text-sm bg-white border-gray-300" 
        />
      </div>
      <div>
        <Label htmlFor="address">Endereço Completo</Label>
        <div className="relative mt-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            id="address" 
            value={formData.address} 
            onChange={(e) => onChange('address', e.target.value)} 
            placeholder="Rua Exemplo, 123, Cidade" 
            className="pl-10 text-sm bg-white border-gray-300" 
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Telefone (com DDD)</Label>
          <div className="relative mt-1">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              id="phone" 
              value={formData.phone} 
              onChange={(e) => onChange('phone', e.target.value)} 
              placeholder="(11) 91234-5678" 
              className="pl-10 text-sm bg-white border-gray-300" 
            />
          </div>
        </div>
        <div>
          <Label htmlFor="whatsapp">WhatsApp (com DDD)</Label>
          <div className="relative mt-1">
            <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              id="whatsapp" 
              value={formData.whatsapp} 
              onChange={(e) => onChange('whatsapp', e.target.value)} 
              placeholder="(11) 91234-5678" 
              className="pl-10 text-sm bg-white border-gray-300" 
            />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default BusinessInfoSection;