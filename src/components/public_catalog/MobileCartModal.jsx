import React from 'react';
    import CartSummary from './CartSummary';
    import { motion, AnimatePresence } from 'framer-motion';

    const MobileCartModal = ({
      isCartOpenMobile,
      setIsCartOpenMobile,
      cart,
      addToCart,
      removeFromCart,
      onCheckout,
      total,
      businessData,
      theme,
      primaryColor,
    }) => {
      if (!isCartOpenMobile) return null;

      return (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsCartOpenMobile(false)}
          >
            <CartSummary
              cart={cart}
              onAddToCart={addToCart}
              onRemoveFromCart={removeFromCart}
              onCheckout={onCheckout}
              total={total}
              deliveryFee={businessData?.settings?.delivery_fee || 0}
              isOpen={businessData?.settings?.is_open}
              onClose={() => setIsCartOpenMobile(false)}
              theme={theme}
              primaryColor={primaryColor}
            />
          </motion.div>
        </AnimatePresence>
      );
    };

    export default MobileCartModal;