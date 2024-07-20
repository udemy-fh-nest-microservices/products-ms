# Products Microservice

## Development Environment

1. Clonar el repo.
2. Instalar dependencias:

```bash
pnpm install
```

3. Copiar el archivo `.env.example`, renombrarlo a `.env` y completar las variables de entorno según corresponda.
4. Ejecutar la migración de Prisma:

```bash
pnpx prisma migrate dev
```

5. Iniciar el servidor de NATS:

```bash
docker run -d --name nats-server -p 4222:4222 -p 8222:8222 nats
```

6. Iniciar Products Service en modo desarrollo:

```bash
pnpm start:dev
```
