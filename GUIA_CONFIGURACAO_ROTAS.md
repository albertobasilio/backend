# Configuração de Infraestrutura e Rotas - Sabor Inteligente MZ

Este documento detalha a configuração do servidor Nginx e o mapeamento das rotas da API para o sistema Sabor Inteligente MZ, conforme as especificações de deploy no domínio `athenarhdlearning.com`.

## 1. Configuração do Servidor Nginx

O sistema utiliza o Nginx como proxy reverso, redirecionando o tráfego HTTPS para os containers/serviços internos do frontend e backend.

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name athenarhdlearning.com www.athenarhdlearning.com;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name athenarhdlearning.com www.athenarhdlearning.com;

    # Certificados SSL (Certbot)
    ssl_certificate     /etc/letsencrypt/live/athenarhdlearning.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/athenarhdlearning.com/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    # Aumenta limite de upload para imagens de scan de ingredientes
    client_max_body_size 500m;

    # FRONTEND (Serviço rodando na porta 8088)
    location / {
        proxy_pass http://127.0.0.1:8088;
        proxy_http_version 1.1;

        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    # API (Backend rodando na porta 8085)
    location /e-learning/api/ {
        proxy_pass http://127.0.0.1:8085/;
        proxy_http_version 1.1;

        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

## 2. Configuração de Variáveis de Ambiente

Para que o sistema funcione com a configuração acima, as seguintes variáveis devem ser ajustadas:

### Backend (`backend/.env`)
```env
PORT=8085
FRONTEND_URL=https://athenarhdlearning.com
# Outras configurações de Banco de Dados e IA mantêm-se as mesmas
```

### Frontend (`frontend/src/services/api.js`)
```javascript
const API_URL = 'https://athenarhdlearning.com/e-learning/api';
```

---

## 3. Mapeamento de Rotas da API

Todas as rotas abaixo estão sob o prefixo `/e-learning/api/` no proxy reverso (mapeado para `/api/` internamente no backend).

### Autenticação (`/auth`)
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| POST | `/login` | Autenticação de usuário |
| POST | `/register` | Cadastro de novo usuário |
| POST | `/forgot-password` | Solicitação de recuperação de senha |
| POST | `/reset-password` | Definição de nova senha |
| GET | `/profile` | Obter dados do perfil logado |
| PUT | `/profile` | Atualizar dados do perfil |
| PUT | `/dietary-profile` | Atualizar preferências alimentares |

### Receitas (`/recipes`)
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/` | Listar receitas disponíveis |
| GET | `/:id` | Detalhes de uma receita |
| GET | `/public/:id` | Detalhes de receita pública |
| POST | `/generate` | Gerar receita via IA |
| POST | `/match` | Encontrar receitas compatíveis com ingredientes |
| POST | `/save` | Salvar receita personalizada |

### Ingredientes & Scan (`/ingredients`)
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/` | Listar ingredientes conhecidos |
| POST | `/scan` | Processar imagem de ingredientes (OCR/IA) |
| GET | `/history/scans` | Histórico de scans realizados |
| POST | `/substitutions` | Sugestões de substituições de ingredientes |

### Inteligência Artificial (`/ai`)
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| POST | `/analyze-image` | Análise profunda de imagem de prato/ingrediente |
| POST | `/generate-recipes` | Geração avançada de receitas |
| POST | `/enrich-instructions` | Melhorar passos de uma receita |

### Planejamento e Listas (`/meal-plans`, `/shopping-lists`)
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/meal-plans` | Obter planos de refeição do usuário |
| POST | `/meal-plans` | Criar novo plano de refeição |
| GET | `/shopping-lists` | Listar listas de compras |
| POST | `/shopping-lists/generate` | Gerar lista de compras automática |
| PUT | `/shopping-lists/item/:id/toggle` | Marcar/desmarcar item da lista |

### Administração (`/admin`)
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/users` | Listar todos os usuários (Admin) |
| PUT | `/users/:id/access` | Alterar nível de acesso/roles |
| GET | `/metrics` | Visualizar métricas do sistema |
| GET | `/recipes` | Gerenciar todas as receitas |

### Desafios (`/challenges`)
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/active` | Listar desafios ativos |
| POST | `/:id/join` | Participar de um desafio |
| GET | `/mine` | Ver meus desafios ativos |

---

## 4. Notas de Implementação
- **Limite de Upload:** O Nginx foi configurado com `500m` para suportar o envio de imagens de alta resolução para o scanner de IA.
- **Redirecionamento SSL:** Todo o tráfego HTTP é forçado para HTTPS para segurança dos dados dos usuários.
- **Proxy Pass:** A barra no final de `proxy_pass http://127.0.0.1:8085/;` é importante para remover o prefixo `/e-learning/api/` antes de passar para o backend se este estiver esperando rotas sem o prefixo (ou ajustado via rewrite).
