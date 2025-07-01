import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUploadSection from '@/components/settings/ImageUploadSection';

const AppearanceSection = ({ 
  logo, 
  banner, 
  onImageUpload, 
  onRemoveImage, 
  logoInputRef, 
  bannerInputRef,
  uploadingLogo,
  uploadingBanner
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Aparência do Catálogo</CardTitle>
      <CardDescription>Personalize o logo e o banner do seu catálogo.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <ImageUploadSection
        title="Logo do Estabelecimento"
        description="Use uma imagem quadrada (ex: PNG, JPG). Máximo 2MB."
        currentImage={logo}
        onImageUpload={onImageUpload}
        onRemoveImage={onRemoveImage}
        inputRef={logoInputRef}
        fieldType="logo"
        isUploading={uploadingLogo}
        previewClassName="w-20 h-20"
      />
      
      <ImageUploadSection
        title="Banner (Capa do Catálogo)"
        description="Recomendado: imagem retangular (ex: 1200x400 pixels). Máximo 2MB."
        currentImage={banner}
        onImageUpload={onImageUpload}
        onRemoveImage={onRemoveImage}
        inputRef={bannerInputRef}
        fieldType="banner"
        isUploading={uploadingBanner}
        previewClassName="w-full h-32 sm:h-40"
      />
    </CardContent>
  </Card>
);

export default AppearanceSection;