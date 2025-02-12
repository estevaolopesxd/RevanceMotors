##este funciona atualmente

FROM node:16 AS build

# Definir o diretório de trabalho
WORKDIR /app

# Copiar o package.json e o package-lock.json
COPY package*.json ./

# Instalar as dependências
RUN npm install

# Copiar os arquivos restantes da aplicação
COPY . .

# Construir a aplicação React para produção
RUN npm run build

# Etapa 2: Rodar a aplicação usando o servidor Node.js
FROM node:16

# Definir o diretório de trabalho
WORKDIR /app

# Copiar os arquivos da build gerada na etapa anterior
COPY --from=build /app/build /app/build

# Instalar o http-server, que serve os arquivos estáticos
RUN npm install -g http-server

# Expor a porta 5000
EXPOSE 5000

# Comando para rodar a aplicação
CMD ["http-server", "build", "-p", "5000"]

