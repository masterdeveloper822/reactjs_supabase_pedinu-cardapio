
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import ProductForm from '@/components/products/ProductForm';
import ProductPreview from '@/components/products/ProductPreview';
import ProductList from '@/components/products/ProductList';

function ProductsPage() {
  const { categories, addProduct, updateProduct, deleteProduct, selectedCategoryFilter, setSelectedCategoryFilter, refreshData } = useData();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const initialFormData = useCallback(() => ({
    name: '',
    description: '',
    price: '',
    promotionalPrice: '',
    image: '',
    categoryId: selectedCategoryFilter || (categories[0]?.id || ''),
    available: true
  }), [selectedCategoryFilter, categories]);

  const [formData, setFormData] = useState(initialFormData());
  const [previewData, setPreviewData] = useState(formData);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    setPreviewData(formData);
  }, [formData]);

  useEffect(() => {
    if (!isDialogOpen) {
        setFormData(initialFormData());
        setEditingProduct(null);
    }
  }, [isDialogOpen, initialFormData]);


  const handleOpenDialog = (product = null, categoryIdForNew = '') => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        promotionalPrice: product.promotional_price?.toString() || '',
        image: product.image_url || '',
        categoryId: product.category_id || '',
        available: product.available !== undefined ? product.available : true
      });
    } else {
      const baseFormData = initialFormData();
      if (categoryIdForNew) {
        setFormData({ ...baseFormData, categoryId: categoryIdForNew });
      } else {
        setFormData(baseFormData);
      }
      setEditingProduct(null);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.price || !formData.categoryId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, preço e categoria.",
        variant: "destructive"
      });
      return;
    }

    const productDataPayload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      promotionalPrice: formData.promotionalPrice ? parseFloat(formData.promotionalPrice) : null,
      image: formData.image, 
      category_id: formData.categoryId, 
      available: formData.available
    };
    
    let result = null;
    if (editingProduct) {
      result = await updateProduct(editingProduct.id, productDataPayload);
      if (result) {
        toast({
            title: "Produto atualizado!",
            description: "As alterações foram salvas com sucesso."
        });
      } else {
         toast({
            title: "Erro ao atualizar",
            description: "Não foi possível salvar as alterações.",
            variant: "destructive"
        });
      }
    } else {
      result = await addProduct(productDataPayload);
      if (result) {
        toast({
            title: "Produto adicionado!",
            description: `${formData.name} foi adicionado ao cardápio.`
        });
      } else {
         toast({
            title: "Erro ao adicionar",
            description: "Não foi possível adicionar o produto.",
            variant: "destructive"
        });
      }
    }

    if (result) {
      setIsDialogOpen(false);
      refreshData();
    }
  };

  const handleDeleteProduct = async (product) => {
    await deleteProduct(product.id);
    toast({
      title: "Produto removido!",
      description: `${product.name} foi removido do cardápio.`
    });
    refreshData();
  };

  const toggleProductAvailability = async (product) => {
    const result = await updateProduct(product.id, { 
      ...product, 
      image: product.image_url, 
      category_id: product.category_id, 
      promotionalPrice: product.promotional_price, 
      available: !product.available 
    });
    
    if (result) {
      toast({
        title: product.available ? "Produto indisponível" : "Produto disponível",
        description: `${product.name} foi ${product.available ? 'marcado como indisponível' : 'marcado como disponível'}.`
      });
      refreshData();
    }
  };


  if (!categories) {
    return <div>Carregando categorias...</div>;
  }

  return (
    <div className={`flex ${showPreview ? 'flex-col lg:flex-row' : 'flex-col'} h-full overflow-hidden`}>
      <div className={`${showPreview ? 'lg:w-2/3' : 'w-full'} p-6 space-y-6 overflow-y-auto`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
            <p className="text-gray-600 mt-1">
              Gerencie todos os produtos do seu cardápio.
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="hover:bg-red-50 hover:border-red-300"
            >
              {showPreview ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
              {showPreview ? "Ocultar Pré-visualização" : "Mostrar Pré-visualização"}
            </Button>
            <Button
                className="bg-gradient-to-r from-red-500 to-red-700"
                onClick={() => handleOpenDialog()} disabled={categories.length === 0}
            >
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
            </Button>
            {categories.length === 0 && (
                <p className="text-xs text-red-600">Crie uma categoria primeiro.</p>
            )}
          </div>
        </motion.div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </DialogTitle>
            </DialogHeader>
            <ProductForm
                formData={formData}
                setFormData={setFormData}
                editingProduct={editingProduct}
                handleSubmit={handleSubmit}
                setIsDialogOpen={setIsDialogOpen}
            />
            </DialogContent>
        </Dialog>

        <ProductList
          handleOpenDialog={handleOpenDialog}
          handleDeleteProduct={handleDeleteProduct}
          toggleProductAvailability={toggleProductAvailability}
        />
      </div>

      {showPreview && (
        <ProductPreview
          previewData={previewData}
          isDialogOpen={isDialogOpen}
          editingProduct={editingProduct}
          selectedCategoryFilter={selectedCategoryFilter}
        />
      )}
    </div>
  );
}

export default ProductsPage;
