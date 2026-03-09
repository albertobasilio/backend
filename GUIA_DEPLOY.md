# Guia de Deploy - Sabor Inteligente MZ

Este guia contém as instruções para publicar o sistema usando Vercel (Frontend) e sua VPS (Backend).

## 1. Frontend (Vercel)

1.  Crie uma conta na [Vercel](https://vercel.com).
2.  Importe o repositório do seu projeto ou use a CLI da Vercel.
3.  **Configurações Importantes:**
    *   **Framework Preset:** Vite
    *   **Root Directory:** `frontend`
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `dist`
4.  **Variáveis de Ambiente (Environment Variables):**
    Adicione no painel da Vercel:
    *   `VITE_API_URL`: `https://athenarhdlearning.com/e-learning/api` (ou o domínio que apontar para sua VPS).

## 2. Backend (Sua VPS)

Assumindo que você usa Ubuntu/Debian na VPS:

### Passo A: Instalar dependências (se não tiver)
```bash
sudo apt update
sudo apt install nodejs npm -y
sudo npm install -g pm2
```

### Passo B: Preparar os arquivos
1. Envie a pasta `backend/` para a sua VPS.
2. Dentro da pasta `backend/` na VPS, rode:
```bash
npm install --production
```

### Passo C: Rodar com PM2
Dentro da pasta `backend/` na VPS, use o arquivo que criei:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Passo D: Configurar Nginx (Opcional, mas recomendado para HTTPS)
Para que `https://athenarhdlearning.com/e-learning/api` funcione, seu Nginx na VPS deve estar assim:

```nginx
location /e-learning/api/ {
    proxy_pass http://localhost:5000/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## 3. Banco de Dados
Certifique-se de que o IP da sua VPS tem permissão para acessar o banco `102.211.186.44`. Como os dados já estão no seu arquivo `ecosystem.config.js`, a conexão será automática.

## 4. Pastas de Uploads
Crie a pasta de uploads se ela não existir na VPS:
```bash
mkdir -p backend/uploads
```
