# --- Giai đoạn 1: Dependencies ---
FROM node:25-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Cài đặt pnpm
RUN npm install -g pnpm

# Copy file định nghĩa package để tận dụng cache của Docker
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- Giai đoạn 2: Builder ---
FROM node:25-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Tắt dữ liệu thu thập của Next.js trong quá trình build
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# --- Giai đoạn 3: Runner (Sản phẩm cuối) ---
FROM node:25-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Tạo user để chạy app (bảo mật hơn chạy root)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy các file cần thiết từ builder
# Standalone chỉ copy code cần chạy, bỏ qua devDependencies và file thừa
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

# Chạy bằng server.js được sinh ra bởi output: 'standalone'
CMD ["node", "server.js"]