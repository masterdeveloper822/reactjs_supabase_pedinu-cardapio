import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Building2, Palette, Truck, CreditCard, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useImageUpload } from '@/hooks/useImageUpload';

import DigitalMenuLinkSection from '@/components/settings/CatalogLinkSection';
import AppearanceSection from '@/components/settings/AppearanceSection';
import BusinessInfoSection from '@/components/settings/BusinessInfoSection';
import OrderSettingsSection from '@/components/settings/OrderSettingsSection';
import DeliveryZonesSection from '@/components/settings/DeliveryZonesSection';

function Settings() {
  const { 
    businessSettings, 
    updateBusinessSettings,
    deliveryZones,
    addDeliveryZone,
    updateDeliveryZone,
    deleteDeliveryZone
  } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    description: '',
    address: '',
    phone: '',
    whatsapp: '',
    delivery_fee: 0,
    min_order_value: 0,
    logo_url: '',
    banner_url: '',
    mercadopago_public_key: '',
    mercadopago_access_token: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const { uploadingLogo, uploadingBanner, handleImageUpload } = useImageUpload(user, toast);

  const tabs = [
    {
      id: 0,
      name: 'Negócio',
      icon: Building2,
      component: 'business'
    },
    {
      id: 1,
      name: 'Aparência',
      icon: Palette,
      component: 'appearance'
    },
    {
      id: 2,
      name: 'Entrega',
      icon: Truck,
      component: 'delivery'
    },
    {
      id: 3,
      name: 'Pagamentos',
      icon: CreditCard,
      component: 'payments'
    },
    {
      id: 4,
      name: 'Link',
      icon: Link,
      component: 'link'
    }
  ];

  useEffect(() => {
    if (businessSettings) {
      setFormData({
        description: businessSettings.description || '',
        address: businessSettings.address || '',
        phone: businessSettings.phone || '',
        whatsapp: businessSettings.whatsapp || '',
        delivery_fee: businessSettings.delivery_fee || 0,
        min_order_value: businessSettings.min_order_value || 0,
        logo_url: businessSettings.logo_url || '',
        banner_url: businessSettings.banner_url || '',
        mercadopago_public_key: businessSettings.mercadopago_public_key || '',
        mercadopago_access_token: businessSettings.mercadopago_access_token || ''
      });
    }
  }, [businessSettings]);

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleImageUploadWrapper = (event, fieldType) => {
    handleImageUpload(event, fieldType, handleChange);
  };

  const removeImage = (fieldType) => {
    const fieldName = fieldType === 'logo' ? 'logo_url' : 'banner_url';
    handleChange(fieldName, '');
    
    if (fieldType === 'logo' && logoInputRef.current) {
      logoInputRef.current.value = "";
    }
    if (fieldType === 'banner' && bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }

    toast({
      title: "Imagem removida",
      description: `${fieldType === 'logo' ? 'Logo' : 'Banner'} foi removido.`
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const { delivery_fee, ...otherFormData } = formData;
      await updateBusinessSettings(otherFormData);
      
      toast({
        title: "Configurações salvas!",
        description: "Suas alterações foram aplicadas com sucesso."
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewDigitalMenu = () => {
    if (!user?.business_slug) {
      toast({
        title: "Erro",
        description: "Slug do negócio não encontrado.",
        variant: "destructive"
      });
      return;
    }
    window.open(`${window.location.origin}/cardapio/${user.business_slug}`, '_blank');
  };

  const handleShareDigitalMenu = () => {
    if (!user?.business_slug) {
      toast({
        title: "Erro",
        description: "Slug do negócio não encontrado.",
        variant: "destructive"
      });
      return;
    }
    
    const digitalMenuUrl = `${window.location.origin}/cardapio/${user.business_slug}`;
    navigator.clipboard.writeText(digitalMenuUrl);
    toast({
      title: "Link copiado!",
      description: "Link do cardápio digital copiado para a área de transferência."
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Negócio
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <BusinessInfoSection formData={formData} onChange={handleChange} />
          </motion.div>
        );
      
      case 1: // Aparência
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AppearanceSection 
              logo={formData.logo_url} 
              banner={formData.banner_url} 
              onImageUpload={handleImageUploadWrapper} 
              onRemoveImage={removeImage} 
              logoInputRef={logoInputRef} 
              bannerInputRef={bannerInputRef}
              uploadingLogo={uploadingLogo}
              uploadingBanner={uploadingBanner}
            />
          </motion.div>
        );
      
      case 2: // Entrega
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <OrderSettingsSection formData={formData} onChange={handleChange} />
            <DeliveryZonesSection 
              deliveryZones={deliveryZones}
              onAdd={addDeliveryZone}
              onUpdate={updateDeliveryZone}
              onDelete={deleteDeliveryZone}
            />
          </motion.div>
        );
      
      case 3: // Pagamentos
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">Configurações de Pagamento</h3>
                <p className="text-sm text-muted-foreground">Conecte sua conta do Mercado Pago para receber pagamentos online via Pix e Cartão de Crédito.</p>
              </div>
              <div className="p-6 pt-0">
                <form className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center" htmlFor="mercadopago_public_key">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                        <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"></path>
                        <circle cx="16.5" cy="7.5" r=".5"></circle>
                      </svg>
                      Public Key
                    </label>
                    <input 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                      id="mercadopago_public_key" 
                      name="mercadopago_public_key" 
                      placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" 
                      value={formData.mercadopago_public_key || ''}
                      onChange={(e) => handleChange('mercadopago_public_key', e.target.value)}
                    />
                    <p className="text-sm text-gray-500">Sua chave pública do Mercado Pago. Encontrada no seu <a href="https://www.mercadopago.com.br/developers/panel/credentials" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">painel de desenvolvedor</a>.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center" htmlFor="mercadopago_access_token">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                      </svg>
                      Access Token
                    </label>
                    <input 
                      type="password" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                      id="mercadopago_access_token" 
                      name="mercadopago_access_token" 
                      placeholder="••••••••••••••••••••••••••••••••••••••••••••••" 
                      value={formData.mercadopago_access_token || ''}
                      onChange={(e) => handleChange('mercadopago_access_token', e.target.value)}
                    />
                    <p className="text-sm text-gray-500">Seu token de acesso para produção. Mantenha esta chave segura.</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Como funciona o Split de Pagamento</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• <strong>95%</strong> vai diretamente para sua conta Mercado Pago</p>
                      <p>• <strong>5%</strong> é retido pela plataforma como taxa de serviço</p>
                      <p>• O split acontece automaticamente em cada transação</p>
                      <p>• Você recebe o dinheiro diretamente na sua conta</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2" 
                      type="submit"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSave();
                      }}
                    >
                      Salvar Credenciais
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        );
      
      case 4: // Link
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DigitalMenuLinkSection 
              businessSlug={user?.business_slug} 
              onView={handleViewDigitalMenu} 
              onShare={handleShareDigitalMenu} 
            />
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  const motionProps = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay }
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.div {...motionProps()} className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Configurações</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Ajuste as preferências do seu negócio e cardápio.</p>
        </div>
        <Button 
          onClick={handleSave} 
          className="bg-red-600 hover:bg-red-700 text-white mt-4 sm:mt-0"
          disabled={isSaving || uploadingLogo || uploadingBanner}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div {...motionProps(0.1)}>
        <div 
          role="tablist" 
          aria-orientation="horizontal"
          className="h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
          tabIndex="0"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-950 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                tabIndex={activeTab === tab.id ? 0 : -1}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div {...motionProps(0.2)} className="min-h-[400px]">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`tabpanel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            className={activeTab === tab.id ? 'block' : 'hidden'}
          >
            {activeTab === tab.id && renderTabContent()}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default Settings;