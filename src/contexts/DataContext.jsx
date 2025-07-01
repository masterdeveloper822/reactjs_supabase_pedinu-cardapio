import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessSettings } from '@/hooks/data/useBusinessSettings';
import { useCategories } from '@/hooks/data/useCategories';
import { useProducts } from '@/hooks/data/useProducts';
import { useDeliveryZones } from '@/hooks/data/useDeliveryZones';
import { useKitchenOrders } from '@/hooks/data/useKitchenOrders';
import { useCustomers } from '@/hooks/data/useCustomers';

const DataContext = createContext();

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser usado dentro de um DataProvider');
  }
  return context;
}

export function DataProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [loadingData, setLoadingData] = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  const { businessSettings, loadBusinessSettings, updateBusinessSettings } = useBusinessSettings(user);
  const { categories, loadCategories, addCategory, updateCategory, deleteCategory: originalDeleteCategory, reorderCategories } = useCategories(user);
  const { products, loadProducts, addProduct, updateProduct, deleteProduct, reorderProducts } = useProducts(user);
  const { deliveryZones, loadDeliveryZones, addDeliveryZone, updateDeliveryZone, deleteDeliveryZone } = useDeliveryZones(user);
  const { kitchenOrders, loadKitchenOrders, addKitchenOrder, updateKitchenOrderStatus, cancelKitchenOrder, getKitchenOrders } = useKitchenOrders(user);
  const { customers, customerOrders, loadCustomers, loadCustomerOrders, saveCustomerOrder, getCustomerStats } = useCustomers(user);

  const deleteCategory = useCallback((id) => {
    return originalDeleteCategory(id, loadProducts);
  }, [originalDeleteCategory, loadProducts]);

  useEffect(() => {
    const loadAllDataForUser = async () => {
      if (user && user.id) {
        setLoadingData(true);
        await Promise.all([
          loadBusinessSettings(user),
          loadCategories(user.id),
          loadProducts(user.id),
          loadDeliveryZones(user.id),
          loadKitchenOrders(user.id),
          loadCustomers(user.id),
          loadCustomerOrders(user.id)
        ]);
        setLoadingData(false);
      } else if(!authLoading) {
        setLoadingData(false);
      }
    };

    loadAllDataForUser();
  }, [user, authLoading, loadBusinessSettings, loadCategories, loadProducts, loadDeliveryZones, loadKitchenOrders, loadCustomers, loadCustomerOrders]);

  const refreshData = useCallback(async () => {
    if (user && user.id) {
      setLoadingData(true);
      await Promise.all([
        loadBusinessSettings(user),
        loadCategories(user.id),
        loadProducts(user.id),
        loadDeliveryZones(user.id),
        loadKitchenOrders(user.id),
        loadCustomers(user.id),
        loadCustomerOrders(user.id)
      ]).finally(() => setLoadingData(false));
    }
  }, [user, loadBusinessSettings, loadCategories, loadProducts, loadDeliveryZones, loadKitchenOrders, loadCustomers, loadCustomerOrders]);
  
  const value = {
    businessSettings,
    updateBusinessSettings,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    reorderProducts,
    deliveryZones,
    addDeliveryZone,
    updateDeliveryZone,
    deleteDeliveryZone,
    kitchenOrders,
    addKitchenOrder,
    updateKitchenOrderStatus,
    cancelKitchenOrder,
    getKitchenOrders,
    customers,
    customerOrders,
    loadCustomers,
    loadCustomerOrders,
    saveCustomerOrder,
    getCustomerStats,
    loadingData,
    refreshData,
    selectedCategoryFilter, 
    setSelectedCategoryFilter,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}