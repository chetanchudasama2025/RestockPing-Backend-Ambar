import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { sendSms, isTwilioConfigured } from './config/twilio';
import labelsRouter from './routes/labels';
import requestsRouter from './routes/requests';
import teamRouter from './routes/team';
import locationsRouter from './routes/locations';
import { generateCaptcha, verifyCaptchaEndpoint } from './middleware/captcha';
import { smsThrottle } from './middleware/throttle';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
const allowAllCors = String(process.env.CORS_ALLOW_ALL || '').toLowerCase() === 'true';
const rawCorsOrigins = process.env.CORS_ORIGINS || (
  process.env.NODE_ENV === 'production'
    ? ''
    : 'http://localhost:3000,http://localhost:3001'
);
const wildcardCors = rawCorsOrigins.trim() === '*';
const allowedOrigins = rawCorsOrigins.split(',').map(o => o.trim()).filter(Boolean);

const isDevLike = process.env.NODE_ENV !== 'production';
const usePermissiveCors = allowAllCors || wildcardCors || isDevLike;

if (usePermissiveCors) {
  app.use(cors({ origin: true, credentials: true }));
} else {
  app.use(cors({
    origin: (origin, callback) => {
      let isAllowed = false;
      if (!origin) {
        isAllowed = true; // non-browser or same-origin
      } else if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        isAllowed = true;
      }

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root route
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to RestockPing Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/labels', labelsRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/team', teamRouter);
app.use('/api/locations', locationsRouter);

// CORS debug route (temporary)
app.get('/__cors-debug', (req, res) => {
  res.json({
    env: {
      NODE_ENV: process.env.NODE_ENV,
      CORS_ALLOW_ALL: process.env.CORS_ALLOW_ALL,
      CORS_ORIGINS: process.env.CORS_ORIGINS
    },
    computed: {
      allowAllCors,
      wildcardCors,
      allowedOrigins
    },
    request: {
      origin: req.headers.origin || null
    },
    timestamp: new Date().toISOString()
  });
});

// Captcha routes
app.get('/api/captcha', generateCaptcha);
app.post('/api/captcha/verify', verifyCaptchaEndpoint);

// Supabase connection test route (accept GET/POST)
app.all('/test-supabase', async (_req, res) => {
  try {
    // Import Supabase client dynamically to avoid startup errors
    const { supabase } = await import('./config/supabase');
    
    // Test the connection by making a simple query
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      // If table doesn't exist, that's okay - we're just testing connection
      if (error.code === '42P01') { // Table doesn't exist
        return res.json({
          success: true,
          message: 'Supabase connection successful!',
          status: 'connected',
          note: 'Table "users" does not exist yet - this is normal for new projects',
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Supabase connection failed',
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }

    return res.json({
      success: true,
      message: 'Supabase connection successful!',
      status: 'connected',
      data: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Supabase connection test error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to test Supabase connection',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }

  return; // fallback for TS7030
});

// SMS send route
app.post('/sms/send', smsThrottle, async (req, res) => {
  try {
    if (!isTwilioConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'SMS service not configured. Set TWILIO_* env vars.'
      });
    }

    const { to, body, from, messagingServiceSid } = req.body || {};
    if (!to || !body) {
      return res.status(400).json({
        success: false,
        message: '`to` and `body` are required in JSON payload'
      });
    }

    const message = await sendSms({ to, body, from, messagingServiceSid });
    return res.json({
      success: true,
      sid: message.sid,
      status: message.status,
      to: message.to,
      from: message.from
    });
  } catch (error) {
    console.error('SMS send error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send SMS',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Twilio webhook endpoint for SMS status callbacks
app.post('/api/sms/webhook', (req, res) => {
  try {
    const {
      MessageSid,
      MessageStatus,
      To,
      From,
      ErrorCode,
      ErrorMessage,
      DateCreated,
      DateUpdated
    } = req.body;

    console.log('SMS Status Callback:', {
      MessageSid,
      MessageStatus,
      To,
      From,
      ErrorCode,
      ErrorMessage,
      DateCreated,
      DateUpdated,
      timestamp: new Date().toISOString()
    });

    // Respond with 200 OK to acknowledge receipt
    res.status(200).send('OK');
  } catch (error) {
    console.error('SMS webhook error:', error);
    res.status(500).send('Error processing webhook');
  }
});

// 404 handler for undefined routes
app.use('*', (req, res, _next) => {
  return res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      code: 'NOT_FOUND'
    },
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' && statusCode === 500 
        ? 'Internal Server Error' 
        : message
    },
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API running at: http://localhost:${PORT}`);
    console.log(`🔌 Supabase test: http://localhost:${PORT}/test-supabase`);
    console.log(`✉️  SMS send: POST http://localhost:${PORT}/sms/send { to, body }`);
  });
}

export default app;
