# Stage 1: Build the frontend
FROM node:18 AS build

WORKDIR /app

# Copy only package.json and pnpm-lock.yaml (if using pnpm)
COPY apps/frontend/package.json ./ 
# COPY apps/frontend/pnpm-lock.yaml ./  

# Install dependencies
RUN npm install  # or `pnpm install`

# Now copy only the source code excluding node_modules, .next, etc.
COPY apps/frontend/ ./ 

# Build the Next.js app
RUN npm run build  # or `pnpm build`

# Stage 2: Run the frontend
FROM node:18 AS production

WORKDIR /app

# Copy the build files from the build stage
COPY --from=build /app /app

# Install only production dependencies
RUN npm install --production  # or `pnpm install --prod`

# Expose port 3000 for the app
EXPOSE 3000

# Start the app
CMD ["npm", "start"]  # or `pnpm start`
