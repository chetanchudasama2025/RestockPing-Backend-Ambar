# RestockPing Team API - Complete Guide

## 📋 Overview

This guide provides everything you need for the RestockPing Team API: complete documentation, Postman collection, testing instructions, and implementation details.

## 🚀 Quick Start

### 1. Import Postman Collection
- Import `RestockPing-Team-API.postman_collection.json`
- Import `RestockPing-Team-API.postman_environment.json`
- Set your environment variables

### 2. Configure Environment
```bash
# Required environment variables
JWT_SECRET=your-secret-key
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

### 3. Start Server
```bash
npm run dev
```

## 📁 API Endpoints

### 📍 Location Operations

#### GET /api/locations
Get all locations with their details. No authentication required.

**Response - Success (200):**
```json
{
  "success": true,
  "locations": [
    {
      "id": "uuid-location-1",
      "name": "New York Office",
      "slug": "ny_office",
      "timezone": "America/New_York"
    },
    {
      "id": "uuid-location-2",
      "name": "London Office",
      "slug": "london_office",
      "timezone": "Europe/London"
    }
  ],
  "total": 2
}
```

**Response - No Locations (200):**
```json
{
  "success": true,
  "locations": [],
  "total": 0
}
```

### 🔐 Authentication

#### POST /api/team/login
Authenticate with team PIN and location ID.

**Request Body:**
```json
{
  "pin": "1234",
  "location_id": "uuid-location-id"
}
```

**Response - Success (200):**
```json
{
  "success": true,
  "session_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 1800
}
```

**Response - Error (401):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Rate Limiting:** 5 attempts per IP per minute

### 🏷️ Label Operations

#### POST /api/team/scan
Lookup label by code or ID. Requires authentication.

**Headers:**
```
Authorization: Bearer <session_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "SMARTPHONE"
}
```

**Response - Success (200):**
```json
{
  "success": true,
  "label": {
    "id": "uuid-label-id",
    "code": "SMARTPHONE",
    "name": "Smartphones",
    "synonyms": "phone, mobile, cell",
    "location_id": "uuid-location-id",
    "location_name": "NY Office",
    "active": true
  }
}
```

**Response - Not Found (404):**
```json
{
  "success": false,
  "message": "Label not found"
}
```

**Rate Limiting:** 20 requests per IP per minute

### 📢 Alert Operations

#### POST /api/team/send
Send alert message to all active subscribers of a label. Enforces 3-hour rate limiting per label.

**Headers:**
```
Authorization: Bearer <session_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "labelId": "uuid-label-id",
  "message": "🚨 Alert: Product is now available! Check our store for the latest stock."
}
```

**Response - Success (200):**
```json
{
  "success": true,
  "sent_count": 5,
  "total_subscribers": 5,
  "label_name": "Smartphones"
}
```

**Response - Rate Limited (429):**
```json
{
  "success": false,
  "message": "Rate limit exceeded. This label was already sent an alert within the last 3 hours."
}
```

**Response - No Subscribers (404):**
```json
{
  "success": false,
  "message": "No active subscribers found for this label"
}
```

**Response - SMS Service Unavailable (503):**
```json
{
  "success": false,
  "message": "SMS service not configured"
}
```

### 📊 Audit Logs

#### GET /api/team/logs
View audit logs with pagination support. Access restricted to session.

**Headers:**
```
Authorization: Bearer <session_token>
```

**Query Parameters:**
- `limit` (number, optional): Number of logs to return (default: 50, max: 100)
- `offset` (number, optional): Number of logs to skip for pagination (default: 0)

**Response - Success (200):**
```json
{
  "success": true,
  "logs": [
    {
      "id": "uuid-send-id",
      "date": "2025-01-15",
      "user": "Team Member (PIN: 12345678...)",
      "action": "Sent alert",
      "details": "Sent 5 subscribers",
      "sent_count": 5,
      "label_name": "Smartphones"
    }
  ],
  "total": 10,
  "limit": 50,
  "offset": 0
}
```

**Response - Unauthorized (401):**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

## 🔒 Security Features

### Authentication
- JWT session tokens with 30-minute expiration
- Location-specific access control
- PIN-based authentication with bcrypt hashing

### Rate Limiting
- **Login**: 5 attempts per IP per minute
- **Scan**: 20 requests per IP per minute
- **Send**: 3-hour cooldown per label

### Privacy Protection
- Truncated PIN IDs in logs (e.g., "PIN: 12345678...")
- Location-based data isolation
- Secure token handling

## 🧪 Testing with Postman

### Collection Structure
```
RestockPing Team API
├── Location Operations
│   └── Get All Locations (with response examples)
├── Authentication
│   └── Team Login (with response examples)
├── Label Operations  
│   └── Scan Label by Code (with response examples)
├── Alert Operations
│   └── Send Alert to Label Subscribers (with response examples)
├── Audit Logs
│   ├── View Audit Logs - Default
│   ├── View Audit Logs - Paginated
│   ├── View Audit Logs - First Page
│   ├── View Audit Logs - Second Page
│   ├── View Audit Logs - Invalid Parameters
│   └── View Audit Logs - Excessive Limit
├── Error Scenarios
│   ├── Invalid HTTP Methods
│   └── Authentication Errors
├── Rate Limiting Tests
│   ├── Login Rate Limiting
│   └── Scan Rate Limiting
└── Complete Workflow
    └── Full Team Workflow (5-step sequence)
```

### Environment Variables
| Variable | Description | Example Value |
|----------|-------------|---------------|
| `base_url` | API base URL | `http://localhost:3000` |
| `session_token` | JWT session token (auto-set) | `eyJhbGciOiJIUzI1NiIs...` |
| `location_id` | Location ID for authentication | `uuid-location-id` |
| `label_id` | Label ID for operations (auto-set) | `uuid-label-id` |
| `label_code` | Label code for scanning | `SMARTPHONE` |
| `test_pin` | Team PIN for login | `1234` |
| `test_message` | Default alert message | `🚨 Alert: Product is now available!` |

### Complete Workflow Testing
1. **Get Locations**: Run "Location Operations > Get All Locations" to get location IDs
2. **Login**: Run "Authentication > Team Login" to get a session token
3. **Scan**: Run "Label Operations > Scan Label by Code" to find a label
4. **Send**: Run "Alert Operations > Send Alert to Label Subscribers"
5. **View Logs**: Run "Audit Logs > View Audit Logs - Default"

## 🛠️ Setup Requirements

### Database Setup
```bash
# Run database migrations
npm run db:migrate

# Seed with sample data
npm run db:seed

# Set up team PINs
npm run team:setup
```

### Server Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or build and start production
npm run build
npm start
```

## 📊 Log Format

### Simple List Format
Each log entry follows the format: **"YYYY-MM-DD, User X, Sent X subscribers."**

**Example Log Entries:**
- `"2025-01-15, Team Member (PIN: 12345678...), Sent 5 subscribers"`
- `"2025-01-14, Team Member (PIN: 87654321...), Sent 3 subscribers"`
- `"2025-01-13, Team Member (PIN: 11223344...), Sent 8 subscribers"`

### Detailed Log Structure
- **Date**: YYYY-MM-DD format
- **User**: "Team Member (PIN: 12345678...)" (truncated for privacy)
- **Action**: "Sent alert"
- **Details**: "Sent X subscribers"
- **Sent Count**: Number of subscribers who received the alert
- **Label Name**: Name of the label that was sent to

## 🚨 Error Handling

### HTTP Status Codes
- `200`: Success
- `400`: Bad Request (missing/invalid parameters)
- `401`: Unauthorized (invalid/missing authentication)
- `404`: Not Found (label not found, no subscribers)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error
- `503`: Service Unavailable (SMS service down)

### Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```

## 🔄 Automated Testing

### Collection Runner
1. Select the collection
2. Choose the environment
3. Run all requests in sequence
4. Review test results

### Newman (CLI)
```bash
# Install Newman
npm install -g newman

# Run collection
newman run RestockPing-Team-API.postman_collection.json \
  -e RestockPing-Team-API.postman_environment.json \
  --reporters cli,html
```

## 🎯 Best Practices

1. **Always use environment variables** for sensitive data
2. **Test error scenarios** to ensure proper error handling
3. **Verify rate limiting** with multiple rapid requests
4. **Check authentication** on all protected endpoints
5. **Validate pagination** with different limit/offset values
6. **Test CORS** with different origins
7. **Monitor response times** for performance issues

## 🐛 Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check session token and expiration
2. **404 Not Found**: Verify label IDs and location IDs
3. **429 Rate Limited**: Wait for rate limit window to reset
4. **500 Internal Error**: Check server logs and database connection
5. **CORS Issues**: Verify CORS configuration in server

### Debug Tips

1. Enable request/response logging in Postman
2. Check server console for detailed error messages
3. Verify environment variables are set correctly
4. Test with curl commands for comparison
5. Check database for proper data setup

## 📚 Implementation Details

### Database Schema
- **team_pins**: Stores team PINs with bcrypt hashes
- **locations**: Location information
- **labels**: Product labels with codes and names
- **optins**: Subscriber information
- **sends**: Send history and audit logs

### Rate Limiting Implementation
- Custom middleware using in-memory storage
- IP-based request tracking
- Configurable windows and limits
- Proper HTTP 429 responses with retry information

### Security Implementation
- JWT tokens with configurable expiration
- bcrypt password hashing
- Location-based access control
- Privacy protection in logs

## 🎉 Summary

The Team API provides:
- ✅ **5 API Endpoints** fully implemented and tested
- ✅ **Complete Authentication Flow** with JWT sessions
- ✅ **Comprehensive Error Handling** for all scenarios
- ✅ **Rate Limiting** properly implemented and tested
- ✅ **Security Features** verified and working
- ✅ **Postman Collection** ready for immediate use
- ✅ **Audit Logging** with privacy protection
- ✅ **Documentation** complete and comprehensive

**The Team API is production-ready and fully tested! 🚀**

---

**Files Included:**
- `RestockPing-Team-API.postman_collection.json` - Complete Postman collection
- `RestockPing-Team-API.postman_environment.json` - Environment variables
- `TEAM-API-COMPLETE-GUIDE.md` - This comprehensive guide

**Ready for immediate use with complete testing and documentation support!**
