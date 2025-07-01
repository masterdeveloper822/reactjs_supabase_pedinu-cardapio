import { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useImageUpload = (user, toast) => {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const uploadImageToStorage = async (file, folder) => {
    if (!user?.id) throw new Error('Usuário não autenticado');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('business-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('business-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (event, fieldType, onImageChange) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Selecione uma imagem (JPEG, PNG, etc.).",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 2MB.",
        variant: "destructive"
      });
      return;
    }

    const setUploading = fieldType === 'logo' ? setUploadingLogo : setUploadingBanner;
    const fieldName = fieldType === 'logo' ? 'logo_url' : 'banner_url';

    try {
      setUploading(true);

      let imageUrl;
      
      try {
        imageUrl = await uploadImageToStorage(file, fieldType);
        toast({
          title: "Upload realizado!",
          description: `${fieldType === 'logo' ? 'Logo' : 'Banner'} enviado com sucesso.`
        });
      } catch (storageError) {
        console.warn('Falha no upload para Storage, usando base64:', storageError);
        imageUrl = await convertToBase64(file);
        toast({
          title: "Imagem carregada!",
          description: `${fieldType === 'logo' ? 'Logo' : 'Banner'} carregado localmente.`
        });
      }

      onImageChange(fieldName, imageUrl);

    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível carregar a imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadingLogo,
    uploadingBanner,
    handleImageUpload
  };
};