import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useBusinessSettings = (user) => {
  const [businessSettings, setBusinessSettings] = useState(null);

  const loadBusinessSettings = useCallback(async (currentLoggedUser) => {
    if (!currentLoggedUser) return;
    const { data, error } = await supabase
      .from('business_settings')
      .select('*')
      .eq('user_id', currentLoggedUser.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { 
        console.error('Error loading business settings:', error);
    } else if (data) {
        setBusinessSettings(data);
    } else { 
        const defaultSettings = {
            user_id: currentLoggedUser.id,
            is_open: true,
            description: `Bem-vindo ao ${currentLoggedUser.business_name || 'seu negócio'}!`,
            whatsapp_quick_replies: [],
        };
        const { data: newSettings, error: insertError } = await supabase
            .from('business_settings')
            .insert(defaultSettings)
            .select()
            .single();
        if (insertError) console.error('Error creating initial business settings:', insertError);
        else setBusinessSettings(newSettings);
    }
  }, []);

  const updateBusinessSettings = async (updates) => {
    if (!user || !businessSettings) return;
    const { data, error } = await supabase
      .from('business_settings')
      .update(updates)
      .eq('user_id', user.id)
      .eq('id', businessSettings.id) 
      .select()
      .single();
    if (error) console.error('Error updating business settings:', error);
    else setBusinessSettings(data);
  };

  return { businessSettings, loadBusinessSettings, updateBusinessSettings };
};