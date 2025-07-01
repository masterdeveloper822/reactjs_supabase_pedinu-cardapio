import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import ImageUploadField from '@/components/products/ImageUploadField';

const ProductForm = ({ formData, setFormData, editingProduct, handleSubmit, setIsDialogOpen }) => {
  const { categories } = useData();

  return (
    <>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div>
          <Label htmlFor="name">Nome do Produto</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Hambúrguer Artesanal"
          />
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descreva os ingredientes e características"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Preço (R$)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="25.90"
            />
          </div>
          <div>
            <Label htmlFor="promotionalPrice">Preço Promocional (R$)</Label>
            <Input
              id="promotionalPrice"
              type="number"
              step="0.01"
              value={formData.promotionalPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, promotionalPrice: e.target.value }))}
              placeholder="19.90 (opcional)"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="category">Categoria</Label>
          <select
            id="category"
            value={formData.categoryId}
            onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
            className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="">Selecione uma categoria</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <ImageUploadField
          value={formData.image}
          onChange={(imageUrl) => setFormData(prev => ({ ...prev, image: imageUrl }))}
          label="Imagem do Produto"
        />

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="available"
            checked={formData.available}
            onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
            className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <Label htmlFor="available">Disponível para venda</Label>
        </div>
      </div>
      <div className="flex space-x-2 mt-4">
        <Button
          onClick={handleSubmit}
          className="flex-1 bg-red-600 hover:bg-red-700"
          disabled={!formData.name.trim() || !formData.price || !formData.categoryId}
        >
          {editingProduct ? 'Atualizar Produto' : 'Criar Produto'}
        </Button>
        <Button
          variant="outline"
          onClick={() => setIsDialogOpen(false)}
          className="flex-1"
        >
          Cancelar
        </Button>
      </div>
    </>
  );
};

export default ProductForm;