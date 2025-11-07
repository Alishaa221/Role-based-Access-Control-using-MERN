# Use Node.js official image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port your backend runs on
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
