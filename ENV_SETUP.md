# Environment Variables Setup

The sunbar-api uses **dotenv** to load environment variables from the `.env` file.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your values:**
   ```bash
   nano .env  # or use your preferred editor
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

## Environment Variables

### Server Configuration

- `PORT` - Server port (default: 3002)
- `HOST` - Server host (default: 0.0.0.0)
- `NODE_ENV` - Environment mode (development/production)
- `LOG_LEVEL` - Logging level (info/debug/warn/error)

### MongoDB Configuration

- `MONGODB_URI` - MongoDB connection string
  - Local: `mongodb://localhost:27017/sunbar`
  - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/?appName=sunbar`

### CORS Configuration

- `CORS_ORIGIN` - Allowed origin for CORS (default: http://localhost:3000)

## Troubleshooting

### Environment variables not loading

1. **Check .env file exists:**
   ```bash
   ls -la .env
   ```

2. **Check file format** - No extra spaces or special characters:
   ```env
   PORT=3002
   # NOT: PORT = 3002
   # NOT: PORT=3002 
   ```

3. **Restart the server** after making changes to `.env`

### MongoDB connection issues

1. **For local MongoDB:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/sunbar
   ```

2. **For MongoDB Atlas:**
   - Ensure IP whitelist includes your IP
   - Check username/password are correct
   - Verify connection string format

### CORS errors

1. **Check origin matches frontend URL:**
   ```env
   CORS_ORIGIN=http://localhost:3000
   ```

2. **For multiple origins in production**, you'll need to update the CORS configuration in `src/server.ts`
