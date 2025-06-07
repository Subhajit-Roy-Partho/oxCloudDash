
# Stage 1: Install dependencies and build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json ./
COPY package-lock.json ./
# If using yarn:
# COPY yarn.lock ./

# Install dependencies
RUN npm install
# If using yarn:
# RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Set build-time arguments if needed (e.g., for API URLs)
# ARG NEXT_PUBLIC_API_BASE_URL_INTERNAL
# ENV NEXT_PUBLIC_API_BASE_URL_INTERNAL=$NEXT_PUBLIC_API_BASE_URL_INTERNAL
# ARG NEXT_PUBLIC_API_BASE_URL_PUBLIC
# ENV NEXT_PUBLIC_API_BASE_URL_PUBLIC=$NEXT_PUBLIC_API_BASE_URL_PUBLIC

# Build the Next.js application
RUN npm run build
# If using yarn:
# RUN yarn build

# Stage 2: Serve the application from a lean image
FROM node:18-alpine

WORKDIR /app

# Copy built assets from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
# If you have a custom server.js, copy that too

# Install production dependencies (if any, Next.js typically bundles them)
# RUN npm ci --only=production
# If using yarn:
# RUN yarn install --production --frozen-lockfile

# Expose the port the app runs on
EXPOSE 3000

# Set environment variable for port (Next.js default is 3000)
ENV PORT 3000
# ENV NODE_ENV production # next start automatically sets this

# Command to run the application
CMD ["npm", "start"]
# If using yarn:
# CMD ["yarn", "start"]

