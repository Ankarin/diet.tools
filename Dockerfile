FROM oven/bun:latest

WORKDIR /app/next-app

COPY package.json ./
COPY bun.lockb ./

RUN bun install

COPY . .

# Next.js collects completely anonymous telemetry data about general usage. Learn more here: https://nextjs.org/telemetry
# Uncomment the following line to disable telemetry at run time
ENV NEXT_TELEMETRY_DISABLED 1

# Build the Next.js application
RUN bun run build

# Start the Next.js application in production mode
CMD ["bun", "--bun", "start"]

# Expose the port the app runs on
EXPOSE 3000
