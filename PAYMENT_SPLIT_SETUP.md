# 🏦 Sistema de Split de Pagamento - Mercado Pago

## 📋 Visão Geral

Este sistema implementa um **split automático de pagamentos** onde:
- **95%** vai diretamente para a conta do negócio
- **5%** é retido pela plataforma como taxa de serviço (fixo)
- O split acontece automaticamente em cada transação
- Cada negócio usa suas próprias credenciais do Mercado Pago

## 🚀 Configuração

### 1. Variáveis de Ambiente da Plataforma

Adicione estas variáveis ao seu arquivo `.env`:

```env
# Credenciais da Plataforma (você precisa criar uma conta Mercado Pago para a plataforma)
VITE_MERCADOPAGO_PLATFORM_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_MERCADOPAGO_PLATFORM_ACCESS_TOKEN=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# URL da aplicação
VITE_APP_URL=https://seu-dominio.com
```

### 2. Configuração do Mercado Pago

#### Para a Plataforma:
1. Crie uma conta Mercado Pago para a plataforma
2. Acesse o [Painel de Desenvolvedor](https://www.mercadopago.com.br/developers/panel/credentials)
3. Copie as credenciais de **Produção** (não sandbox)
4. Configure as variáveis de ambiente acima

#### Para cada Negócio:
1. O negócio cria sua própria conta Mercado Pago
2. Acessa o [Painel de Desenvolvedor](https://www.mercadopago.com.br/developers/panel/credentials)
3. Copia suas credenciais de **Produção**
4. Configura no painel de Settings → Pagamentos

### 3. Executar Migração do Banco

Execute o arquivo `database_migration_payment_split.sql` no seu banco Supabase:

```sql
-- Execute este arquivo no SQL Editor do Supabase
-- database_migration_payment_split.sql
```

## 💳 Como Funciona

### Fluxo de Pagamento:

1. **Cliente seleciona Pix/Cartão** no checkout
2. **Sistema cria preferência** no Mercado Pago usando credenciais da plataforma
3. **Split automático configurado**:
   - 95% para o negócio
   - 5% para a plataforma
4. **Cliente é redirecionado** para o Mercado Pago
5. **Pagamento processado** com split automático
6. **Dinheiro vai direto** para a conta do negócio
7. **Taxa da plataforma** é retida automaticamente

### Estrutura de Dados:

```sql
-- Tabela de pagamentos
payments (
  id UUID PRIMARY KEY,
  preference_id TEXT UNIQUE,           -- ID da preferência Mercado Pago
  payment_id TEXT,                     -- ID do pagamento (após processamento)
  business_user_id UUID,               -- ID do negócio
  amount DECIMAL(10,2),                -- Valor total
  platform_fee DECIMAL(10,2),          -- Taxa da plataforma (5%)
  business_amount DECIMAL(10,2),       -- Valor para o negócio (95%)
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  payment_method TEXT,
  items JSONB,                         -- Itens do pedido
  status TEXT,                         -- pending/approved/rejected/cancelled
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 🔧 Configuração por Negócio

### No Painel de Settings:

1. **Acesse**: Settings → Pagamentos
2. **Configure**:
   - **Public Key**: Sua chave pública do Mercado Pago
   - **Access Token**: Seu token de acesso de produção

### Exemplo de Configuração:

```
Public Key: APP_USR-12345678-1234-1234-1234-123456789012
Access Token: APP_USR-12345678-1234-1234-1234-123456789012
```

**Nota**: A taxa da plataforma é fixa em 5% para todos os negócios.

## 📊 Monitoramento

### Para Negócios:
- **Dashboard**: Visualize todos os pagamentos
- **Relatórios**: Receita, taxas, status dos pagamentos
- **Histórico**: Todos os pagamentos com detalhes

### Para Administradores:
- **Estatísticas da Plataforma**: Total de receita, taxas coletadas
- **Monitoramento**: Todos os pagamentos de todos os negócios
- **Relatórios**: Performance da plataforma

## 🔒 Segurança

### RLS (Row Level Security):
- Negócios só veem seus próprios pagamentos
- Administradores veem todos os pagamentos
- Validação automática de valores
- Triggers para integridade dos dados

### Validações:
- Verificação de valores (business_amount + platform_fee = amount)
- Valores positivos obrigatórios
- Status válidos apenas
- Timestamps automáticos

## 🚨 Troubleshooting

### Erro: "Credenciais da plataforma não configuradas"
- Verifique as variáveis de ambiente
- Confirme que as credenciais são de produção
- Teste as credenciais no painel do Mercado Pago

### Erro: "Payment amounts do not match"
- Verifique a lógica de cálculo do split
- Confirme que o valor está sendo calculado corretamente (5% fixo)
- Valide os valores antes de salvar

### Pagamento não aparece no dashboard:
- Verifique o webhook do Mercado Pago
- Confirme que o status está sendo atualizado
- Verifique os logs do banco de dados

## 📈 Próximos Passos

### Funcionalidades Futuras:
- [ ] Webhook para atualização automática de status
- [ ] Relatórios detalhados de receita
- [ ] Integração com sistema de notificações
- [ ] Dashboard de analytics avançado
- [ ] Sistema de reembolso automático

### Melhorias Técnicas:
- [ ] Cache de credenciais
- [ ] Retry automático em falhas
- [ ] Logs detalhados de transações
- [ ] Backup automático de dados
- [ ] Monitoramento de performance

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console
2. Confirme as configurações do Mercado Pago
3. Teste com valores pequenos primeiro
4. Entre em contato com o suporte técnico

---

**⚠️ Importante**: Sempre teste em ambiente de desenvolvimento antes de usar em produção! 