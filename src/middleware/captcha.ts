import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface CaptchaSession {
  question: string;
  answer: number;
  timestamp: number;
  verified?: boolean;
  verifiedAnswer?: number;
  attempts?: number;
}

// Store captcha sessions in memory (in production, use Redis)
const captchaSessions = new Map<string, CaptchaSession>();

// Clean up expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  const expireTime = 5 * 60 * 1000; // 5 minutes
  
  for (const [key, session] of captchaSessions.entries()) {
    if (now - session.timestamp > expireTime) {
      captchaSessions.delete(key);
    }
  }
}, 5 * 60 * 1000);

const generateMathQuestion = (): { question: string; answer: number } => {
  const operations = ['+', '-', '*'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let num1: number, num2: number, answer: number, question: string;
  
  switch (operation) {
    case '+':
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      answer = num1 + num2;
      question = `${num1} + ${num2} = ?`;
      break;
    case '-':
      num1 = Math.floor(Math.random() * 20) + 10;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 - num2;
      question = `${num1} - ${num2} = ?`;
      break;
    case '*':
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 * num2;
      question = `${num1} × ${num2} = ?`;
      break;
    default:
      num1 = 3;
      num2 = 5;
      answer = 8;
      question = '3 + 5 = ?';
  }
  
  return { question, answer };
};

// Generate captcha challenge
export const generateCaptcha = (req: Request, res: Response) => {
  try {
    const { question, answer } = generateMathQuestion();
    const sessionId = crypto.randomUUID();
    
    captchaSessions.set(sessionId, {
      question,
      answer,
      timestamp: Date.now(),
      attempts: 0
    });
    
    res.json({
      success: true,
      sessionId,
      question,
      expiresIn: 300 // 5 minutes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate captcha',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Verify captcha answer
export const verifyCaptcha = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { captchaSessionId, captchaAnswer } = req.body;
    
    if (!captchaSessionId || captchaAnswer === undefined) {
      res.status(400).json({
        success: false,
        message: 'Captcha session ID and answer are required'
      });
      return;
    }
    
    const session = captchaSessions.get(captchaSessionId);
    
    if (!session) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired captcha session'
      });
      return;
    }
    
    // Check if session is expired (5 minutes)
    const now = Date.now();
    if (now - session.timestamp > 5 * 60 * 1000) {
      captchaSessions.delete(captchaSessionId);
      res.status(400).json({
        success: false,
        message: 'Captcha session expired'
      });
      return;
    }
    
    // Check if this session was already verified via the verification endpoint
    if (session.verified && session.verifiedAnswer === parseInt(captchaAnswer)) {
      // Session was pre-verified, delete it and continue
      captchaSessions.delete(captchaSessionId);
      next();
      return;
    }
    
    // Verify answer normally
    const userAnswer = parseInt(captchaAnswer);
    if (isNaN(userAnswer) || userAnswer !== session.answer) {
      // Delete session after failed attempt
      captchaSessions.delete(captchaSessionId);
      res.status(400).json({
        success: false,
        message: 'Incorrect captcha answer'
      });
      return;
    }
    
    // Captcha is correct, delete session and continue
    captchaSessions.delete(captchaSessionId);
    next();
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Captcha verification failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Dedicated captcha verification endpoint (for frontend testing)
export const verifyCaptchaEndpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { captchaSessionId, captchaAnswer } = req.body;
    
    if (!captchaSessionId || captchaAnswer === undefined) {
      res.status(400).json({
        success: false,
        message: 'Captcha session ID and answer are required'
      });
      return;
    }
    
    const session = captchaSessions.get(captchaSessionId);
    
    if (!session) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired captcha session'
      });
      return;
    }
    
    // Check if session is expired (5 minutes)
    const now = Date.now();
    if (now - session.timestamp > 5 * 60 * 1000) {
      captchaSessions.delete(captchaSessionId);
      res.status(400).json({
        success: false,
        message: 'Captcha session expired'
      });
      return;
    }
    
    // Verify answer
    const userAnswer = parseInt(captchaAnswer);
    if (isNaN(userAnswer) || userAnswer !== session.answer) {
      // Increment attempts counter
      session.attempts = (session.attempts || 0) + 1;
      
      // Delete session after 3 failed attempts
      if (session.attempts >= 3) {
        captchaSessions.delete(captchaSessionId);
        res.status(400).json({
          success: false,
          message: 'Too many failed attempts. Please get a new captcha.'
        });
        return;
      }
      
      res.status(400).json({
        success: false,
        message: `Incorrect captcha answer. ${3 - session.attempts} attempts remaining.`
      });
      return;
    }
    
    // Captcha is correct, but DON'T delete session yet - let the main request handle it
    // Mark the session as verified for the main request to use
    session.verified = true;
    session.verifiedAnswer = userAnswer;
    
    res.json({
      success: true,
      message: 'Captcha verified successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Captcha verification failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Optional: Google reCAPTCHA integration
export const verifyGoogleRecaptcha = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { recaptchaToken } = req.body;
    
    if (!recaptchaToken) {
      res.status(400).json({
        success: false,
        message: 'reCAPTCHA token is required'
      });
      return;
    }
    
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      res.status(500).json({
        success: false,
        message: 'reCAPTCHA not configured'
      });
      return;
    }
    
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${recaptchaToken}&remoteip=${req.ip}`
    });
    
    const data = await response.json() as any;
    
    if (!data.success) {
      res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed',
        errors: data['error-codes']
      });
      return;
    }
    
    next();
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'reCAPTCHA verification error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
