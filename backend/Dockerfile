FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY prisma ./prisma
COPY certs ./certs
COPY .env .env
RUN npx prisma migrate deploy
RUN npm run seed
EXPOSE 3000
CMD ["node", "dist/main.js"] 