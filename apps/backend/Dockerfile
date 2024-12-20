# Stage 1: Build the backend
FROM node:18 AS build

WORKDIR /app

# Copy package.json and package-lock.json (or pnpm-lock.yaml)
COPY apps/backend/package.json apps/backend/package-lock.json ./
# or if using pnpm
# COPY apps/backend/package.json apps/backend/pnpm-lock.yaml ./

# Install dependencies
RUN npm install  # or `pnpm install`

# Copy the rest of the backend files
COPY apps/backend ./

# Compile TypeScript to JavaScript
RUN npm run build  # or `pnpm run build`

# Stage 2: Run the backend
FROM node:18 AS production

WORKDIR /app

# Copy the built files from the build stage
COPY --from=build /app /app

# Install only production dependencies
RUN npm install --production  # or `pnpm install --prod`

# Expose port 4000 for the backend
EXPOSE 4000

# Start the backend
CMD ["npm", "start"]  # or `pnpm start`
