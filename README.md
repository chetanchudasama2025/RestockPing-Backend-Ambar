# RestockPing Backend

A robust Express.js backend built with TypeScript and Supabase integration for managing product restock alerts and user management.

## Features

- 🚀 **Express.js** with TypeScript
- 🗄️ **Supabase** database integration
- 🔒 **Security middleware** (Helmet, CORS, Rate limiting)
- 📝 **Comprehensive error handling**
- 🏥 **Health check endpoints**
- 👥 **User management API**
- 📊 **Type-safe database operations**

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd RestockPing-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   PORT=3000
   NODE_ENV=development
   ```

4. **Set up your database (One command!)**
   ```bash
   npm run db:setup
   ```
   
   This automatically creates all tables and seeds sample data!
## Usage

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Production
```bash
npm start
```

### Testing
```bash
npm test
```

### Database Management
```bash
npm run db:setup      # Complete database setup (tables + data)
npm run db:create     # Create database tables only
npm run db:seed       # Seed with sample data only
npm run db:populate   # Populate with additional data for testing
npm run db:create-function # Create exec_sql function (if needed)
npm run db:status     # Check database status
npm run db:reset      # Reset database (⚠️ Development only)
```

**📖 See [DATABASE-SETUP.md](DATABASE-SETUP.md) for detailed database setup instructions!**

## API Endpoints