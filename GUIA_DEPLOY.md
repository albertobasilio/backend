# Guia de Deploy Manual (Sem Docker) - Sabor Inteligente MZ

Este guia descreve como realizar o deploy do projeto em um ambiente de produção (VPS + Vercel/Hosting) sem o uso de Docker.

## 1. Backend (VPS Ubuntu/Debian)

### Pré-requisitos
- Node.js (v18+) e npm instalados na VPS.
- Banco de Dados MySQL acessível.
- PM2 (Process Manager 2) para manter o backend rodando.

### Passo 1: Instalação
```bash
# Instalar PM2 globalmente
sudo npm install -g pm2
```

### Passo 2: Preparação do Ambiente
1. Copie a pasta `backend/` para sua VPS.
2. Dentro de `backend/`, crie o arquivo `.env` baseado no `.env.example`:
```bash
cp .env.example .env
nano .env # Edite com suas credenciais reais
```
3. Instale as dependências:
```bash
npm install --production
```

### Passo 3: Execução com PM2
O PM2 garantirá que o backend reinicie automaticamente em caso de falha ou reboot do servidor.
```bash
# Iniciar o servidor usando o ecosystem.config.js
pm2 start ecosystem.config.js

# Salvar a lista de processos para o boot
pm2 save
pm2 startup # Siga as instruções que aparecerem na tela
```

### Passo 4: Configuração do Nginx (Proxy Reverso)
Recomendado para usar domínios e certificados SSL (HTTPS). Exemplo de configuração:

```nginx
server {
    listen 80;
    server_name athenarhdlearning.com;

    location /e-learning/api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 2. Frontend (Vercel ou Similar)

### Passo 1: Configuração na Vercel
1. Conecte seu repositório GitHub/GitLab.
2. Defina o **Root Directory** como `frontend`.
3. Defina o **Build Command** como `npm run build`.
4. Defina o **Output Directory** como `dist`.

### Passo 2: Variáveis de Ambiente
No painel da Vercel, adicione:
- `VITE_API_URL`: `https://athenarhdlearning.com/e-learning/api` (URL onde seu backend estará ouvindo).

---

## 3. Banco de Dados
- Certifique-se de que o MySQL está rodando e que o usuário definido no `.env` tem as permissões necessárias.
- Se o banco estiver em outro servidor, libere o acesso ao IP da VPS do backend.

## 4. Pastas de Logs e Uploads
O backend criará automaticamente as pastas de logs e uploads na primeira execução, mas certifique-se de que o usuário que executa o PM2 tem permissão de escrita no diretório do projeto.
