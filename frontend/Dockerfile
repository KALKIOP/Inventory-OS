# ==========================================
# STAGE 1: Build React Application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Set Vite Environment Variables for production build
# Point to our Docker container's backend endpoint or configurable at runtime
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL:-http://localhost:8000/api}

# Build the app
RUN npm run build

# ==========================================
# STAGE 2: Serve Bundle with Nginx
# ==========================================
FROM nginx:1.25-alpine

# Copy compiled assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration to support SPA routing (fallback to index.html)
RUN echo $'\n\
server {\n\
    listen 80;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html index.htm;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    error_page 500 502 503 504 /50x.html;\n\
    location = /50x.html {\n\
        root /usr/share/nginx/html;\n\
    }\n\
}\n\
' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
