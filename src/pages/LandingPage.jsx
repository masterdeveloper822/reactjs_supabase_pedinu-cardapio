import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Smartphone, TrendingUp, Users, Zap, Star, Shield, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PedinuLogo from '@/components/ui/PedinuLogo';

function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const features = [
    { icon: Smartphone, title: "Cardápio Digital Moderno", description: "Interface intuitiva e responsiva para seus clientes" },
    { icon: TrendingUp, title: "Aumente suas Vendas", description: "Plataforma otimizada para conversão e vendas" },
    { icon: Users, title: "Gestão de Clientes", description: "Controle completo da sua base de clientes" },
    { icon: Zap, title: "Configuração Rápida", description: "Comece a vender em poucos minutos" }
  ];

  const benefits = [
    "Cardápio digital profissional e responsivo",
    "Sistema de pedidos integrado via WhatsApp",
    "Gestão completa de produtos e categorias",
    "Controle de áreas de entrega e taxas",
    "Dashboard com métricas e relatórios",
    "Suporte técnico especializado"
  ];

  const handleGetStarted = () => { window.location.href = '/register'; };
  const handleLogin = () => { window.location.href = '/login'; };

  const mobileMenuVariants = {
    open: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { opacity: 0, y: "-100%", transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <PedinuLogo size="md" />
            
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" onClick={handleLogin} className="text-gray-600 hover:text-orange-600">
                Entrar
              </Button>
              <Button onClick={handleGetStarted} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                Começar Grátis
              </Button>
            </div>
            
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg border-t border-orange-100"
            >
              <div className="px-4 pt-2 pb-4 space-y-2">
                <Button variant="ghost" onClick={handleLogin} className="w-full justify-start text-lg">
                  Entrar
                </Button>
                <Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-lg">
                  Começar Grátis
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 md:space-y-8 text-center lg:text-left"
            >
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Transforme seu
                  <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"> negócio </span>
                  com cardápios digitais
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Crie seu cardápio digital profissional e comece a receber pedidos pelo WhatsApp. Simples, rápido e sem complicações.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-lg px-8 py-6"
                >
                  Começar Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span>Avaliação 4.9/5</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>100% Seguro</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <motion.div 
                className="relative z-10"
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <img 
                  src="https://storage.googleapis.com/hostinger-horizons-assets-prod/b17929dc-42b1-4351-82e3-5a502047181e/22c61d115bc9775c570b80897a92c83c.png"
                  alt="Cardápio digital do Pedinu em smartphone"
                  className="w-full max-w-sm sm:max-w-md mx-auto drop-shadow-2xl cursor-pointer"
                />
              </motion.div>
              <div className="absolute inset-8 md:inset-4 lg:inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 blur-3xl transform rotate-6"></div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-12 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Tudo que você precisa para
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"> vender online</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Uma plataforma completa para restaurantes, pizzarias e lanchonetes criarem seus cardápios digitais
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-orange-100 hover:border-orange-200 transition-colors">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mx-auto">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8 w-full max-w-lg"
            >
              <div className="space-y-4 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Preços transparentes e justos
                </h2>
                <p className="text-lg text-gray-600">
                  Você só paga quando vende. Sem mensalidades, sem taxas escondidas.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-orange-100">
                <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <div className="text-4xl sm:text-5xl font-bold text-gray-900">
                      7,99<span className="text-2xl">%</span>
                      <span className="text-lg font-normal text-gray-600 ml-2">+ R$ 2,67</span>
                    </div>
                    <p className="text-gray-600">por transação + taxa de saque</p>
                  </div>

                  <div className="space-y-3 text-left">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    size="lg" 
                    onClick={handleGetStarted}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  >
                    Começar Agora
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Pronto para começar?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Junte-se a centenas de restaurantes que já estão vendendo mais com o Pedinu
            </p>
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-lg px-8 py-6"
            >
              Criar Meu Cardápio Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-200 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <PedinuLogo size="sm" />
            <div className="flex items-center space-x-6 text-sm text-gray-600 text-center md:text-left">
              <span>© 2025 Pedinu. Todos os direitos reservados.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;