# =============================================
# Sabor Inteligente MZ - Backend Dockerfile
# =============================================

FROM node:20-alpine

# Instalar dependências necessárias para processamento de imagem (Sharp) se necessário
# RUN apk add --no-cache vips-dev fftw-dev build-base

WORKDIR /app

# Copiar ficheiros de dependências
COPY package*.json ./

# Instalar dependências (apenas produção para imagem final)
RUN npm ci --production

# Copiar o resto do código do backend
COPY . .

# Criar directórios necessários para persistência
RUN mkdir -p uploads logs

# Definir permissões para os directórios criados
RUN chmod 777 uploads logs

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=5000

# Porta exposta pela aplicação
EXPOSE 5000

# Health check para monitorizar se o servidor está vivo
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Comando para iniciar o servidor
CMD ["node", "server.js"]
