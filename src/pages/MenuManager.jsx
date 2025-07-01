import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';

function MenuManager() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useData();
  const { toast } = useToast();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    addCategory(newCategoryName.trim());
    setNewCategoryName('');
    setIsDialogOpen(false);
    toast({
      title: "Categoria adicionada!",
      description: `A categoria "${newCategoryName}" foi criada com sucesso.`
    });
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setIsDialogOpen(true);
  };

  const handleUpdateCategory = () => {
    if (!newCategoryName.trim() || !editingCategory) return;
    
    updateCategory(editingCategory.id, { name: newCategoryName.trim() });
    setEditingCategory(null);
    setNewCategoryName('');
    setIsDialogOpen(false);
    toast({
      title: "Categoria atualizada!",
      description: "As alterações foram salvas com sucesso."
    });
  };

  const handleDeleteCategory = (category) => {
    const productsInCategory = products.filter(p => p.categoryId === category.id);
    if (productsInCategory.length > 0) {
      toast({
        title: "Não é possível excluir",
        description: "Esta categoria possui produtos. Remova os produtos primeiro.",
        variant: "destructive"
      });
      return;
    }
    
    deleteCategory(category.id);
    toast({
      title: "Categoria removida!",
      description: `A categoria "${category.name}" foi removida.`
    });
  };

  const getProductCount = (categoryId) => {
    return products.filter(p => p.categoryId === categoryId).length;
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
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Cardápio</h1>
          <p className="text-gray-600 mt-1">
            Organize suas categorias e estruture seu cardápio
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-red-500 to-red-700"
              onClick={() => {
                setEditingCategory(null);
                setNewCategoryName('');
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="categoryName">Nome da Categoria</Label>
                <Input
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Pratos Principais, Bebidas..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      editingCategory ? handleUpdateCategory() : handleAddCategory();
                    }
                  }}
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={!newCategoryName.trim()}
                >
                  {editingCategory ? 'Atualizar' : 'Criar'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Categories List */}
      <div className="grid gap-4">
        {categories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma categoria criada</h3>
            <p className="text-gray-500 mb-4">Comece criando sua primeira categoria de produtos</p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-red-500 to-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Categoria
            </Button>
          </motion.div>
        ) : (
          categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="cursor-move">
                        <GripVertical className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {getProductCount(category.id)} produto(s)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                        className="hover:bg-red-50 hover:border-red-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900">💡 Dicas para organizar seu cardápio</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-red-800">
              <li>• Use categorias claras como "Pratos Principais", "Bebidas", "Sobremesas"</li>
              <li>• Organize as categorias por ordem de importância</li>
              <li>• Mantenha nomes curtos e descritivos</li>
              <li>• Você pode arrastar as categorias para reordená-las</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default MenuManager;