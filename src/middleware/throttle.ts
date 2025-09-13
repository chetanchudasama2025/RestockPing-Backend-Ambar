import { Request, Response, NextFunction } from 'express';

interface ThrottleEntry {
  count: number;
  resetTime: number;
}

// Store throttle data in memory (in production, use Redis)
const throttleStore = new Map<string, ThrottleEntry>();

// Clean up expired entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of throttleStore.entries()) {
    if (now > entry.resetTime) {
      throttleStore.delete(key);
    }
  }
}, 60 * 1000);

interface ThrottleOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export const createThrottle = (options: ThrottleOptions) => {
  const {
    windowMs = 60 * 1000, // 1 minute default
    maxRequests = 5,
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = req.ip || 'unknown';
      const now = Date.now();
      
      let entry = throttleStore.get(key);
      
      // If no entry or window has expired, create new entry
      if (!entry || now > entry.resetTime) {
        entry = {
          count: 0,
          resetTime: now + windowMs
        };
        throttleStore.set(key, entry);
      }
      
      // Check if limit exceeded
      if (entry.count >= maxRequests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        
        res.status(429).json({
          success: false,
          message,
          retryAfter,
          limit: maxRequests,
          remaining: 0,
          resetTime: new Date(entry.resetTime).toISOString()
        });
        return;
      }
      
      // Increment counter
      entry.count++;
      
      // Add throttle headers
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, maxRequests - entry.count).toString(),
        'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
      });
      
      // Store original res.json to track success/failure
      const originalJson = res.json.bind(res);
      res.json = function(body: any) {
        // Check if request was successful (2xx status)
        const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
        
        // If we should skip successful requests, don't count them
        if (skipSuccessfulRequests && isSuccess) {
          entry!.count = Math.max(0, entry!.count - 1);
        }
        
        // If we should skip failed requests, don't count them
        if (skipFailedRequests && !isSuccess) {
          entry!.count = Math.max(0, entry!.count - 1);
        }
        
        return originalJson(body);
      };
      
      next();
      
    } catch (error) {
      console.error('Throttle middleware error:', error);
      next(); // Continue on error to avoid blocking requests
    }
  };
};

// Pre-configured throttles for common use cases
export const strictThrottle = createThrottle({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 3,
  message: 'Rate limit exceeded. Maximum 3 requests per minute.'
});

export const moderateThrottle = createThrottle({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  message: 'Rate limit exceeded. Maximum 5 requests per minute.'
});

export const lenientThrottle = createThrottle({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  message: 'Rate limit exceeded. Maximum 10 requests per minute.'
});

// Special throttle for SMS endpoint (very strict)
export const smsThrottle = createThrottle({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 2,
  message: 'SMS rate limit exceeded. Maximum 2 SMS per minute per IP.'
});

// Throttle for requests endpoint (moderate)
export const requestsThrottle = createThrottle({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 3,
  message: 'Request submission rate limit exceeded. Maximum 3 requests per minute.'
});

// Throttle for PIN login attempts (strict - 5 attempts per minute)
export const pinRateLimit = createThrottle({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  message: 'Too many PIN attempts. Maximum 5 attempts per minute per IP.'
});

// Throttle for team scan endpoint (moderate - 20 scans per minute)
export const scanRateLimit = createThrottle({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20,
  message: 'Too many scan requests. Maximum 20 scans per minute per IP.'
});