
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from "@/components/ui/use-toast";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null);
      return null;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') { 
        console.error('Erro ao buscar perfil:', error);
        setUser({ ...authUser }); 
        return { ...authUser };
      }
      
      const userData = profile ? { ...authUser, ...profile } : { ...authUser };
      setUser(userData);
      return userData;

    } catch (e) {
      console.error('Erro inesperado ao buscar perfil:', e);
      setUser({ ...authUser }); 
      return { ...authUser };
    }
  }, []);

  const checkUser = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Erro ao obter sessão:", error);
        setUser(null);
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("Erro inesperado em checkUser:", e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    checkUser(); 
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if ((event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') && session?.user) {
          await fetchUserProfile(session.user);
        }
      } catch (error) {
        console.error('Erro no auth state change:', error);
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchUserProfile, checkUser]);

  const login = async (email, password) => {
    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('Erro de login:', error);
        
        if (error.message?.includes('Invalid login credentials')) {
          toast({ 
            title: "Credenciais Inválidas", 
            description: "Email ou senha incorretos. Verifique e tente novamente.", 
            variant: "destructive" 
          });
        } else if (error.message?.includes('Email not confirmed')) {
          toast({ 
            title: "Email não confirmado", 
            description: "Verifique seu email e confirme sua conta antes de fazer login.", 
            variant: "destructive" 
          });
        } else {
          toast({ 
            title: "Erro de Login", 
            description: error.message, 
            variant: "destructive" 
          });
        }
        
        return { success: false, error: error.message };
      }
      
      if (signInData.user) {
        return { success: true, user: signInData.user };
      }
      
      return { success: false, error: "Usuário não encontrado após login." };
    } catch (e) {
      console.error("Erro inesperado no login:", e);
      toast({ 
        title: "Erro Crítico de Login", 
        description: "Ocorreu um erro inesperado. Tente novamente.", 
        variant: "destructive" 
      });
      return { success: false, error: "Ocorreu um erro inesperado." };
    }
  };

  const register = async (formData) => {
    const { name, businessName, email, password } = formData;
    setLoading(true);
    
    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            business_name: businessName,
          },
        },
      });

      if (error) {
        console.error('Erro de registro:', error);
        
        if (error.message?.includes('User already registered')) {
          toast({ 
            title: "Email já cadastrado", 
            description: "Este email já está em uso. Tente fazer login ou use outro email.", 
            variant: "destructive" 
          });
        } else if (error.message?.includes('Password should be at least')) {
          toast({ 
            title: "Senha muito fraca", 
            description: "A senha deve ter pelo menos 6 caracteres.", 
            variant: "destructive" 
          });
        } else {
          toast({ 
            title: "Erro de Registro", 
            description: error.message, 
            variant: "destructive" 
          });
        }
        
        setLoading(false);
        return { success: false, error: error.message };
      }
      
      toast({ 
        title: "Registro Bem-sucedido!", 
        description: "Conta criada com sucesso! Você pode fazer login agora."
      });
      
      setLoading(false);
      return { success: true, user: signUpData.user }; 

    } catch (e) {
      console.error("Erro inesperado no registro:", e);
      toast({ 
        title: "Erro Crítico de Registro", 
        description: "Ocorreu um erro inesperado. Tente novamente.", 
        variant: "destructive" 
      });
      setLoading(false);
      return { success: false, error: "Ocorreu um erro inesperado." };
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      if (error) {
        console.error('Erro ao sair:', error);
        
        if (!error.message.toLowerCase().includes('session not found') && 
            !error.message.toLowerCase().includes('session from session_id claim in jwt does not exist') &&
            !error.message.toLowerCase().includes('refresh_token_not_found')) {
          toast({ 
            title: "Erro ao Sair", 
            description: error.message, 
            variant: "destructive" 
          });
        }
      }
      
    } catch (e) {
      console.error("Erro inesperado ao sair:", e);
      
      toast({ 
        title: "Erro Crítico ao Sair", 
        description: "Ocorreu um erro inesperado, mas você foi desconectado.", 
        variant: "destructive" 
      });
    } finally {
      setUser(null); 
      setLoading(false);
    }
  };
  
  const updateUserProfileAndAuth = async (updatedProfileData) => {
    if (!user?.id) {
      toast({ 
        title: "Erro", 
        description: "Usuário não autenticado.", 
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update(updatedProfileData)
        .eq('id', user.id)
        .select()
        .single();

      if (profileError) {
        console.error("Erro ao atualizar perfil (profiles):", profileError);
        toast({ 
          title: "Erro ao Salvar Perfil", 
          description: profileError.message, 
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      let authUserToUpdate = user;
      
      if (updatedProfileData.email && updatedProfileData.email !== user.email) {
        const { data: updatedAuthUser, error: authEmailError } = await supabase.auth.updateUser({ 
          email: updatedProfileData.email 
        });
        
        if (authEmailError) {
          console.error("Erro ao atualizar e-mail na autenticação:", authEmailError);
          toast({ 
            title: "Erro ao Atualizar E-mail", 
            description: authEmailError.message + " Seu e-mail atual não foi alterado.", 
            variant: "destructive"
          });
        } else {
          authUserToUpdate = updatedAuthUser.user; 
          toast({ 
            title: "E-mail Atualizado", 
            description: "Seu e-mail foi alterado. Pode ser necessário confirmar o novo e-mail."
          });
        }
      }
      
      const currentAuthName = user.user_metadata?.name || user.name; 
      if (updatedProfileData.name && updatedProfileData.name !== currentAuthName) {
         const { data: metaUpdatedUser, error: authMetaError } = await supabase.auth.updateUser({
          data: { ...user.user_metadata, name: updatedProfileData.name } 
        });
        
        if (authMetaError) {
          console.error("Erro ao atualizar metadados do usuário (nome):", authMetaError);
          toast({ 
            title: "Erro ao Atualizar Nome", 
            description: authMetaError.message, 
            variant: "destructive"
          });
        } else {
          authUserToUpdate = metaUpdatedUser.user;
        }
      }
      
      const latestUser = { ...authUserToUpdate, ...profileData };
      setUser(latestUser);
      toast({ 
        title: "Perfil Atualizado", 
        description: "Suas informações foram salvas com sucesso!"
      });

    } catch (e) {
      console.error("Erro inesperado ao atualizar perfil:", e);
      toast({ 
        title: "Erro Crítico", 
        description: "Ocorreu um erro inesperado ao salvar o perfil.", 
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUserProfileAndAuth,
    fetchUserProfile 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
