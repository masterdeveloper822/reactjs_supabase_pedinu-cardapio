import React, { useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import DigitalMenuLoading from '@/components/public_catalog/CatalogLoading';
import DigitalMenuError from '@/components/public_catalog/CatalogError';
import DigitalMenuBanner from '@/components/public_catalog/CatalogBanner';
import BusinessInfoDisplay from '@/components/public_catalog/BusinessInfoDisplay';
import MobileBusinessHeader from '@/components/public_catalog/MobileBusinessHeader';
import CategoryNavigation from '@/components/public_catalog/CategoryNavigation';
import DigitalMenuMainContent from '@/components/public_catalog/CatalogMainContent';
import DigitalMenuContainer from '@/components/public_catalog/CatalogContainer';
import MobileCartButton from '@/components/public_catalog/MobileCartButton';
import MobileCartModal from '@/components/public_catalog/MobileCartModal';
import CheckoutModal from '@/components/public_catalog/CheckoutModal';
import SearchModal from '@/components/public_catalog/SearchModal';
import { useCatalogTheme } from '@/contexts/CatalogThemeContext';
import { useCatalogData } from '@/hooks/useCatalogData';
import { useCart } from '@/hooks/useCart';
import { useCartUI } from '@/hooks/useCartUI';
import { useCatalogFilters, scrollToCategory } from '@/utils/catalogHelpers';

const PublicDigitalMenu = () => {
  const { businessSlug } = useParams();
  const { toast } = useToast();
  const { theme: catalogTheme } = useCatalogTheme();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const categoryRefs = useRef({});

  const { businessData, loading, error, refetch } = useCatalogData(businessSlug, toast);
  const { cart, addToCart, removeFromCart, cartTotal, cartItemCount, handleWhatsAppOrder, isProcessingOrder } = useCart(businessData, toast);
  const { 
    isCartOpenMobile, 
    setIsCartOpenMobile, 
    isDesktopCartVisible, 
    isDesktopCartMinimized,
    handleDesktopCartMouseEnter,
    handleDesktopCartMouseLeave,
    toggleDesktopCartMinimize 
  } = useCartUI(cart, cartItemCount);

  const { categoriesToDisplay } = useCatalogFilters(businessData, searchTerm);

  const handleWhatsAppClick = useCallback(() => {
    const whatsappNumber = (businessData?.settings?.whatsapp || businessData?.settings?.phone || '').replace(/\D/g, '');
    if (whatsappNumber) {
      window.open(`https://wa.me/55${whatsappNumber}`, '_blank');
    } else {
      toast({
        title: "Contato não configurado",
        description: "O número de WhatsApp não foi informado.",
        variant: "destructive"
      });
    }
  }, [businessData?.settings?.whatsapp, businessData?.settings?.phone, toast]);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: businessData?.businessName || 'Cardápio Digital',
        text: `Confira o cardápio de ${businessData?.businessName || 'este negócio'}!`,
        url
      }).catch(() => {
        navigator.clipboard.writeText(url);
        toast({
          title: "Link copiado!",
          description: "O link do cardápio digital foi copiado para sua área de transferência."
        });
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado!",
        description: "O link do cardápio digital foi copiado para sua área de transferência."
      });
    }
  }, [businessData?.businessName, toast]);
  
  const handleScrollToCategory = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    scrollToCategory(categoryId, categoryRefs);
  }, []);
  
  const handleCheckout = () => {
    if (!businessData?.settings?.is_open) {
      toast({
        title: "Estabelecimento Fechado",
        description: "Não é possível fazer pedidos com o estabelecimento fechado.",
        variant: "destructive"
      });
      return;
    }
    if (cart.length === 0) {
      toast({
        title: "Carrinho Vazio",
        description: "Adicione itens ao carrinho para continuar.",
        variant: "destructive"
      });
      return;
    }
    if (isProcessingOrder) {
      toast({
        title: "Processando...",
        description: "Aguarde, seu pedido está sendo processado.",
        variant: "default"
      });
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleMenuClick = () => {
    toast({
      title: "🚧 Esta funcionalidade não está implementada ainda—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀",
      description: "Menu lateral em desenvolvimento",
      variant: "default"
    });
  };

  if (loading) return <DigitalMenuLoading theme="light" />;
  if (error || !businessData) {
    return <DigitalMenuError theme="light" message={error || "Erro ao carregar cardápio"} onRetry={refetch} />;
  }
  
  const primaryColorClass = 'red';

  if (!selectedCategory && businessData.categories && businessData.categories.length > 0) {
    setSelectedCategory(businessData.categories[0].id);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <DigitalMenuContainer
        isDesktopCartVisible={isDesktopCartVisible}
        isDesktopCartMinimized={isDesktopCartMinimized}
        handleDesktopCartMouseEnter={handleDesktopCartMouseEnter}
        handleDesktopCartMouseLeave={handleDesktopCartMouseLeave}
        toggleDesktopCartMinimize={toggleDesktopCartMinimize}
        cart={cart}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        onCheckout={handleCheckout}
        total={cartTotal}
        businessData={businessData}
        cartItemCount={cartItemCount}
        theme="light"
        primaryColor={primaryColorClass}
      >
        <div className="hidden lg:block">
          <DigitalMenuBanner 
            bannerUrl={businessData?.settings?.banner_url} 
            theme="light"
            primaryColor={primaryColorClass}
            className="catalog-banner-class"
          >
            <BusinessInfoDisplay 
              businessData={businessData} 
              onShare={handleShare} 
              onWhatsAppClick={handleWhatsAppClick} 
              theme="light"
              primaryColor={primaryColorClass}
            />
          </DigitalMenuBanner>
        </div>
        
        <MobileBusinessHeader 
          businessData={businessData}
          onWhatsAppClick={handleWhatsAppClick}
        />
        
        <CategoryNavigation 
          categories={(businessData.categories || []).sort((a,b) => (a.order_index || 0) - (b.order_index || 0))}
          selectedCategory={selectedCategory} 
          onSelectCategory={handleScrollToCategory}
          onSearchClick={handleSearchClick}
          onMenuClick={handleMenuClick}
          theme="light"
          primaryColor={primaryColorClass}
          className="category-nav-class"
        />

        <DigitalMenuMainContent
          categoriesToDisplay={categoriesToDisplay}
          searchTerm={searchTerm}
          categoryRefs={categoryRefs}
          onAddToCart={addToCart}
          businessIsOpen={businessData.settings.is_open}
          theme="light"
          primaryColor={primaryColorClass}
        />
      </DigitalMenuContainer>
      
      <MobileCartButton
        cartItemCount={cartItemCount}
        isCartOpenMobile={isCartOpenMobile}
        setIsCartOpenMobile={setIsCartOpenMobile}
        theme="light"
        primaryColor={primaryColorClass}
      />

      <MobileCartModal
        isCartOpenMobile={isCartOpenMobile}
        setIsCartOpenMobile={setIsCartOpenMobile}
        cart={cart}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        onCheckout={handleCheckout}
        total={cartTotal}
        businessData={businessData}
        theme="light"
        primaryColor={primaryColorClass}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        businessData={businessData}
        onAddToCart={addToCart}
        theme="light"
        primaryColor={primaryColorClass}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        total={cartTotal}
        deliveryZones={businessData.deliveryZones || []}
        onConfirm={handleWhatsAppOrder}
        businessName={businessData.businessName}
        whatsappNumber={businessData.settings.whatsapp || businessData.settings.phone}
        isProcessingOrder={isProcessingOrder}
        businessData={businessData}
      />

      {cartItemCount > 0 && !isCartOpenMobile && <div className="lg:hidden h-20"></div>}
    </div>
  );
};

export default PublicDigitalMenu;