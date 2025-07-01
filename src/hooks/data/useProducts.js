
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useProducts = (user) => {
  const [products, setProducts] = useState([]);

  const loadProducts = useCallback(async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('products')
      .select('id, user_id, category_id, name, description, price, promotional_price, image_url, available, order_index, created_at, updated_at')
      .eq('user_id', userId)
      .order('category_id') 
      .order('order_index', { ascending: true });
    if (error) console.error('Error loading products:', error);
    else setProducts(data || []);
  }, []);

  const addProduct = async (productData) => {
    if (!user || !productData.category_id) {
        console.error("User or category_id missing for addProduct");
        return null;
    }

    const { data: existingProductsInCategory, error: countError } = await supabase
        .from('products')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('category_id', productData.category_id);

    if (countError) {
        console.error('Error counting products in category:', countError);
        return null;
    }
    
    const newOrderIndex = existingProductsInCategory ? existingProductsInCategory.length : 0;

    const payload = {
        user_id: user.id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        promotional_price: productData.promotionalPrice,
        image_url: productData.image, 
        category_id: productData.category_id,
        available: productData.available,
        order_index: newOrderIndex,
    };

    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error.message, error.details, error.hint);
      return null;
    } else {
      await loadProducts(user.id); 
      return data;
    }
  };

  const updateProduct = async (id, updates) => {
    if (!user) return null;

    const payload = {
        name: updates.name,
        description: updates.description,
        price: updates.price,
        promotional_price: updates.promotionalPrice,
        image_url: updates.image,
        category_id: updates.category_id,
        available: updates.available,
    };
    if (updates.order_index !== undefined) {
        payload.order_index = updates.order_index;
    }

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product:', error);
      return null;
    } else {
      await loadProducts(user.id);
      return data;
    }
  };

  const deleteProduct = async (id) => {
    if (!user) return;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) console.error('Error deleting product:', error);
    else {
      setProducts(prev => prev.filter(prod => prod.id !== id));
    }
  };

  const reorderProducts = async (categoryId, newProductsInCategoryOrder) => {
    if (!user) return;
    const updates = newProductsInCategoryOrder.map((prod, index) => 
      supabase.from('products').update({ order_index: index }).eq('id', prod.id).eq('user_id', user.id).eq('category_id', categoryId)
    );
    await Promise.all(updates.map(p => p.catch(e => console.error('Error reordering products (single):', e))));
    await loadProducts(user.id); 
  };

  return { products, loadProducts, addProduct, updateProduct, deleteProduct, reorderProducts };
};
