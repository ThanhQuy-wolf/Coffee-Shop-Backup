# --- Giai đoạn 1: Build ---
FROM node:18-alpine AS builder

# Cài đặt pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy file định nghĩa package
COPY package.json pnpm-lock.yaml ./

# Cài đặt dependencies (sử dụng --frozen-lockfile để đảm bảo đúng phiên bản)
RUN pnpm install --frozen-lockfile

# Copy toàn bộ code
COPY . .

# Build Next.js (Yêu cầu next.config.js có output: 'export')
RUN pnpm run build

# --- Giai đoạn 2: Run (Sản phẩm cuối) ---
FROM nginx:alpine

# Xóa file mặc định của nginx (tùy chọn nhưng nên làm)
RUN rm -rf /usr/share/nginx/html/*

# Copy folder out từ giai đoạn builder
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]