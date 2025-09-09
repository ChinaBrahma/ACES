FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install system dependencies AND the Chromium browser executable
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    libstdc++ \
    udev \
    dbus \
    glib \
    fontconfig \
    && rm -rf /var/cache/apk/*

# Set the environment variable for Puppeteer to find the executable
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create a non-root user to run the app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Make sure the app directory is owned by our user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Copy package files first for caching
COPY --chown=appuser:appgroup package.json package-lock.json ./

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install dependencies (will now find the system-installed Chromium)
RUN npm install 

# Copy the rest of the app
COPY --chown=appuser:appgroup . .

# Expose server port
EXPOSE 5001

# Start the server
CMD ["node", "server.js"]
