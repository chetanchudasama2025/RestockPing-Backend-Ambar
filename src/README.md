# RestockPing Team API - Source Files

## 📁 Directory Structure

```
src/
├── config/
│   ├── supabase.ts          # Supabase database configuration
│   └── twilio.ts            # Twilio SMS configuration
├── controllers/
│   ├── labelsController.ts  # Labels API controller
│   ├── locationsController.ts # Locations API controller
│   ├── requestsController.ts # Requests API controller
│   └── teamController.ts    # Team API controller (login, scan, send, logs)
├── middleware/
│   ├── captcha.ts           # CAPTCHA middleware
│   ├── errorHandler.ts      # Global error handling
│   ├── notFoundHandler.ts   # 404 handler
│   └── throttle.ts          # Rate limiting middleware
├── routes/
│   ├── labels.ts            # Labels API routes
│   ├── locations.ts         # Locations API routes
│   ├── requests.ts          # Requests API routes
│   └── team.ts              # Team API routes
├── index.ts                 # Main Express application
├── RestockPing-Team-API.postman_collection.json  # Postman collection
├── RestockPing-Team-API.postman_environment.json # Postman environment
├── TEAM-API-COMPLETE-GUIDE.md                    # Complete documentation
└── README.md                # This file
```

## 🚀 API Endpoints

### Location Operations
- **GET /api/locations** - Get all locations

### Team API Endpoints

#### Authentication
- **POST /api/team/login** - PIN authentication with location_id

#### Label Operations
- **POST /api/team/scan** - Lookup label by code/ID

#### Alert Operations
- **POST /api/team/send** - Send alerts to label subscribers

#### Audit Logs
- **GET /api/team/logs** - View audit logs with pagination

## 📋 Quick Start

1. **Import Postman Collection**: Use the provided JSON files
2. **Read Documentation**: See `TEAM-API-COMPLETE-GUIDE.md`
3. **Start Server**: `npm run dev`
4. **Test APIs**: Use the Postman collection

## 🔧 Key Features

- ✅ JWT authentication with 30-minute sessions
- ✅ Location-specific access control
- ✅ Rate limiting (login: 5/min, scan: 20/min, send: 3-hour cooldown)
- ✅ SMS integration with Twilio
- ✅ Audit logging with privacy protection
- ✅ Comprehensive error handling
- ✅ Complete Postman collection with examples

## 📚 Documentation

- **Complete Guide**: `TEAM-API-COMPLETE-GUIDE.md`
- **Postman Collection**: `RestockPing-Team-API.postman_collection.json`
- **Environment**: `RestockPing-Team-API.postman_environment.json`

## 🎯 Ready for Production

All Team API functionality is implemented, tested, and documented. The Postman collection provides comprehensive testing capabilities for all scenarios including authentication, error handling, rate limiting, and complete workflows.

**Everything you need is in the `src/` directory! 🚀**
