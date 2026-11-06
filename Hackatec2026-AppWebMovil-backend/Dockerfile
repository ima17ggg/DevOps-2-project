FROM node:24-alpine

WORKDIR /app

# Instalar dependencias primero para aprovechar la caché de capas de Docker
COPY package*.json ./
RUN npm install

# Copiar el código fuente
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
