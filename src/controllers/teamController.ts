import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase';

interface TeamLoginRequest {
  pin: string;
  location_id: string;
}

interface TeamScanRequest {
  code: string;
  method: 'scan' | 'manual';
}

interface TeamSendRequest {
  labelId: string;
  message: string;
}

interface TeamLoginResponse {
  success: boolean;
  session_token?: string;
  expires_in?: number;
  message?: string;
}

interface TeamScanResponse {
  success: boolean;
  label?: {
    id: string;
    code: string;
    name: string;
    synonyms?: string;
    location_id: string;
    location_name?: string;
    active: boolean;
  };
  subscribers_count?: number;
  sent_count?: number;
  last_sent?: string;
  next_allowed?: string;
  message?: string;
}

interface TeamSendResponse {
  success: boolean;
  sent_count?: number;
  total_subscribers?: number;
  label_name?: string;
  last_send_timestamp?: string;
  next_allowed_send?: string;
  message?: string;
}

interface TeamLogsResponse {
  success: boolean;
  logs?: Array<{
    id: string;
    date: string;
    time: string;
    user: string;
    action: string;
    details: string;
    sent_count?: number;
    label_name?: string;
    full_timestamp: string;
  }>;
  total?: number;
  limit?: number;
  offset?: number;
  message?: string;
}

interface TeamDashboardResponse {
  success: boolean;
  metrics?: {
    activeVisitors: number;
    pendingAlerts: number;
    topLabels: Array<{
      id: string;
      code: string;
      name: string;
      waitingCount: number;
      lastSendTimestamp?: string;
    }>;
  };
  message?: string;
}

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = 30 * 60; // 30 minutes in seconds

export const teamLogin = async (req: Request, res: Response) => {
  try {
    const { pin, location_id }: TeamLoginRequest = req.body;

    // Validate input
    if (!pin || typeof pin !== 'string' || pin.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'PIN is required'
      } as TeamLoginResponse);
    }

    if (!location_id || typeof location_id !== 'string' || location_id.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'location_id is required'
      } as TeamLoginResponse);
    }

    // Get client IP for rate limiting tracking
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

    // Fetch active team PINs for the specific location
    const { data: teamPins, error: fetchError } = await supabaseAdmin
      .from('team_pins')
      .select(`
        id, 
        pin_hash, 
        location_id, 
        active,
        locations(id, name, slug)
      `)
      .eq('active', true)
      .eq('location_id', location_id);

    if (fetchError) {
      console.error('Error fetching team PINs:', fetchError);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as TeamLoginResponse);
    }

    if (!teamPins || teamPins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      } as TeamLoginResponse);
    }

    // Check if PIN matches any active team PIN for this location
    let matchedPin = null;
    for (const teamPin of teamPins) {
      // Handle both bcrypt hashes and SHA-256 hashes from existing data
      if (teamPin.pin_hash) {
        // Check if it's a bcrypt hash (starts with $2b$)
        if (teamPin.pin_hash.startsWith('$2b$')) {
          // It's a proper bcrypt hash
          if (await bcrypt.compare(pin.trim(), teamPin.pin_hash)) {
            matchedPin = teamPin;
            break;
          }
        } else {
          // It's a SHA-256 hash from existing data - compare directly
          const crypto = require('crypto');
          const inputHash = crypto.createHash('sha256').update(pin.trim()).digest('hex');
          if (inputHash === teamPin.pin_hash) {
            matchedPin = teamPin;
            break;
          }
        }
      }
    }

    if (!matchedPin) {
      // Log failed attempt
      console.log(`Failed PIN attempt from IP: ${clientIp} at ${new Date().toISOString()}`);
      
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      } as TeamLoginResponse);
    }

    // Generate JWT token
    const tokenPayload = {
      pinId: matchedPin.id,
      locationId: matchedPin.location_id,
      locationSlug: (matchedPin.locations as any)?.slug,
      locationName: (matchedPin.locations as any)?.name,
      type: 'team_session',
      iat: Math.floor(Date.now() / 1000)
    };

    const sessionToken = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    // Log successful login
    console.log(`Successful team login from IP: ${clientIp}, PIN ID: ${matchedPin.id}, Location: ${(matchedPin.locations as any)?.name || 'unknown'} at ${new Date().toISOString()}`);

    return res.json({
      success: true,
      session_token: sessionToken,
      expires_in: JWT_EXPIRES_IN
    } as TeamLoginResponse);

  } catch (error) {
    console.error('Team login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as TeamLoginResponse);
  }
};

// Middleware to verify team session token
export const verifyTeamSession = (req: Request, res: Response, next: any): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No valid authorization header'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      if (decoded.type !== 'team_session') {
        res.status(401).json({
          success: false,
          message: 'Invalid token type'
        });
        return;
      }

      // Add session info to request object
      (req as any).teamSession = {
        pinId: decoded.pinId,
        locationId: decoded.locationId,
        type: decoded.type
      };

      next();
    } catch (jwtError) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
      return;
    }
  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
    return;
  }
};

// Team logs endpoint - view audit logs
export const teamLogs = async (req: Request, res: Response) => {
  try {
    // Get query parameters for pagination
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100); // Max 100, default 50
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0); // Min 0, default 0

    // Get team session info from request (set by verifyTeamSession middleware)
    const teamSession = (req as any).teamSession;
    if (!teamSession) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as TeamLogsResponse);
    }

    const locationId = teamSession.locationId;

    // Get sends data with related information including user names
    const { data: sends, error: sendsError } = await supabaseAdmin
      .from('sends')
      .select(`
        id,
        sent_at,
        count_sent,
        sender_user_id,
        labels!inner(
          id,
          name,
          code
        ),
        locations!inner(
          id,
          name
        )
      `)
      .eq('location_id', locationId)
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Get all unique sender user IDs from the sends
    const uniqueSenderIds = [...new Set((sends || []).map(send => send.sender_user_id))];
    
    // Fetch user names for all sender IDs
    const senderToUserName = new Map();
    
    if (uniqueSenderIds.length > 0) {
      try {
        const { data: users, error: usersError } = await supabaseAdmin
          .from('users')
          .select('id, name, email')
          .in('id', uniqueSenderIds);

        if (!usersError && users) {
          users.forEach(user => {
            senderToUserName.set(user.id, user.name || user.email || 'Unknown User');
          });
          console.log(`Found ${users.length} users for sender mapping`);
        } else {
          console.log('Could not fetch users, using fallback mapping');
        }
      } catch (error) {
        console.log('Error fetching users, using fallback mapping');
      }
    }
    
    // Additional fallback: Try to get user names from team_pins table
    // This is a backup in case the users table doesn't have the names
    if (uniqueSenderIds.length > 0) {
      try {
        // Get team pins for this location to map PIN IDs to user names
        const { data: teamPins, error: teamPinsError } = await supabaseAdmin
          .from('team_pins')
          .select('id, user_name')
          .eq('location_id', locationId);

        if (!teamPinsError && teamPins) {
          teamPins.forEach(pin => {
            if (pin.user_name && uniqueSenderIds.includes(pin.id)) {
              senderToUserName.set(pin.id, pin.user_name);
            }
          });
          console.log(`Found ${teamPins.length} team pins for user mapping`);
        }
      } catch (error) {
        console.log('Error fetching team pins for user mapping');
      }
    }

    // Debug logging
    console.log('Sender mapping:', Array.from(senderToUserName.entries()));

    if (sendsError) {
      console.error('Error fetching sends:', sendsError);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as TeamLogsResponse);
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from('sends')
      .select('*', { count: 'exact', head: true })
      .eq('location_id', locationId);

    if (countError) {
      console.error('Error fetching total count:', countError);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as TeamLogsResponse);
    }

    // Transform the data into the required format
    const logs = (sends || []).map(send => {
      const date = new Date(send.sent_at).toISOString().split('T')[0]; // Format as YYYY-MM-DD
      const time = new Date(send.sent_at).toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      // Debug logging for each send
      console.log(`Processing send: sender_user_id=${send.sender_user_id}, looking for user name...`);
      
      // Get actual user name from sender mapping
      const userName = senderToUserName.get(send.sender_user_id) || 
                      `Team Member (${send.sender_user_id?.substring(0, 8) || 'unknown'})`;
      
      console.log(`Found user name: ${userName} for sender_user_id: ${send.sender_user_id}`);
      
      const action = 'Sent alert';
      const details = `Sent ${send.count_sent} subscribers to ${(send.labels as any)?.name || 'Unknown Label'}`;
      
      return {
        id: send.id,
        date,
        time,
        user: userName,
        action,
        details,
        sent_count: send.count_sent,
        label_name: (send.labels as any)?.name,
        full_timestamp: send.sent_at
      };
    });

    // Log the logs request
    console.log(`Logs viewed - Location: ${teamSession.locationName || 'unknown'}, IP: ${req.ip || 'unknown'}, Count: ${logs.length} at ${new Date().toISOString()}`);

    return res.json({
      success: true,
      logs,
      total: totalCount || 0,
      limit,
      offset
    } as TeamLogsResponse);

  } catch (error) {
    console.error('Team logs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as TeamLogsResponse);
  }
};

// Team send endpoint - send alert to subscribers of a label
export const teamSend = async (req: Request, res: Response) => {
  try {
    const { labelId, message }: TeamSendRequest = req.body;

    // Validate input
    if (!labelId || typeof labelId !== 'string' || labelId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'labelId is required'
      } as TeamSendResponse);
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'message is required'
      } as TeamSendResponse);
    }

    // Get client IP for rate limiting tracking
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

    // Get team session info from request (set by verifyTeamSession middleware)
    const teamSession = (req as any).teamSession;
    if (!teamSession) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as TeamSendResponse);
    }

    const locationId = teamSession.locationId;
    const trimmedLabelId = labelId.trim();

    // First, verify the label exists and belongs to the team's location
    const { data: label, error: labelError } = await supabaseAdmin
      .from('labels')
      .select(`
        id,
        code,
        name,
        location_id,
        active,
        locations(id, name, slug)
      `)
      .eq('id', trimmedLabelId)
      .eq('location_id', locationId)
      .eq('active', true)
      .single();

    if (labelError || !label) {
      return res.status(404).json({
        success: false,
        message: 'Label not found or inactive'
      } as TeamSendResponse);
    }

    // Check for recent sends to this label (3-hour rate limiting + deduplication)
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    const { data: recentSends, error: recentSendsError } = await supabaseAdmin
      .from('sends')
      .select('id, sent_at, count_sent')
      .eq('label_id', trimmedLabelId)
      .gte('sent_at', threeHoursAgo)
      .order('sent_at', { ascending: false })
      .limit(1);

    // Additional deduplication: Check for very recent sends (within 5 minutes) to prevent spam
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: veryRecentSends, error: veryRecentSendsError } = await supabaseAdmin
      .from('sends')
      .select('id, sent_at')
      .eq('label_id', trimmedLabelId)
      .gte('sent_at', fiveMinutesAgo)
      .limit(1);

    if (recentSendsError || veryRecentSendsError) {
      console.error('Error checking recent sends:', recentSendsError || veryRecentSendsError);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as TeamSendResponse);
    }

    // Deduplication: Check for very recent sends (within 5 minutes) to prevent spam
    if (veryRecentSends && veryRecentSends.length > 0) {
      const lastSend = veryRecentSends[0];
      const nextAllowedTime = new Date(new Date(lastSend.sent_at).getTime() + 5 * 60 * 1000);
      
      return res.status(429).json({
        success: false,
        message: 'Deduplication: This label was sent an alert very recently. Please wait before sending again.',
        last_send_timestamp: lastSend.sent_at,
        next_allowed_send: nextAllowedTime.toISOString()
      } as TeamSendResponse);
    }

    // Rate limiting: Check if there was a recent send within 3 hours
    if (recentSends && recentSends.length > 0) {
      const lastSend = recentSends[0];
      const nextAllowedTime = new Date(new Date(lastSend.sent_at).getTime() + 3 * 60 * 60 * 1000);
      
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. This label was already sent an alert within the last 3 hours.',
        last_send_timestamp: lastSend.sent_at,
        next_allowed_send: nextAllowedTime.toISOString()
      } as TeamSendResponse);
    }

    // Get active subscribers for this label
    const { data: subscribers, error: subscribersError } = await supabaseAdmin
      .from('optins')
      .select('id, phone_e164, status')
      .eq('label_id', trimmedLabelId)
      .eq('location_id', locationId)
      .eq('status', 'active');

    if (subscribersError) {
      console.error('Error fetching subscribers:', subscribersError);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as TeamSendResponse);
    }

    if (!subscribers || subscribers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active subscribers found for this label'
      } as TeamSendResponse);
    }

    // Import Twilio functions
    const { sendSms, isTwilioConfigured } = await import('../config/twilio');

    if (!isTwilioConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'SMS service not configured'
      } as TeamSendResponse);
    }

    // Send SMS to all active subscribers
    let sentCount = 0;
    const failedNumbers: string[] = [];

    for (const subscriber of subscribers) {
      try {
        await sendSms({
          to: subscriber.phone_e164,
          body: message.trim()
        });
        sentCount++;
      } catch (error) {
        console.error(`Failed to send SMS to ${subscriber.phone_e164}:`, error);
        failedNumbers.push(subscriber.phone_e164);
      }
    }

    // Get the actual user ID for the team member
    let senderUserId = null;
    try {
      const { data: teamPin, error: pinError } = await supabaseAdmin
        .from('team_pins')
        .select('id, user_name')
        .eq('id', teamSession.pinId)
        .single();

      if (!pinError && teamPin) {
        // Find the user by name in the users table
        const { data: user, error: userError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('name', teamPin.user_name)
          .single();

        if (!userError && user) {
          senderUserId = user.id;
        }
      }
    } catch (error) {
      console.log('Error finding user ID for team member');
    }

    // Fallback to a default user if we can't find the specific user
    if (!senderUserId) {
      const { data: defaultUser, error: defaultUserError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', 'marie.dubois@restockping.com')
        .single();

      if (!defaultUserError && defaultUser) {
        senderUserId = defaultUser.id;
      }
    }

    // Record the send in the database
    const { error: sendRecordError } = await supabaseAdmin
      .from('sends')
      .insert({
        location_id: locationId,
        label_id: trimmedLabelId,
        count_sent: sentCount,
        sender_user_id: senderUserId
      });

    if (sendRecordError) {
      console.error('Error recording send:', sendRecordError);
      // Don't fail the request if we can't record the send
    }

    // Update optin statuses to 'alerted' for successful sends
    if (sentCount > 0) {
      const successfulSubscriberIds = subscribers
        .filter(sub => !failedNumbers.includes(sub.phone_e164))
        .map(sub => sub.id);

      if (successfulSubscriberIds.length > 0) {
        const { error: updateError } = await supabaseAdmin
          .from('optins')
          .update({ status: 'alerted' })
          .in('id', successfulSubscriberIds);

        if (updateError) {
          console.error('Error updating optin statuses:', updateError);
        }
      }
    }

    // Get the current timestamp for the response
    const currentTimestamp = new Date().toISOString();
    const nextAllowedTime = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

    // Log the send operation
    console.log(`Alert sent - Label: ${label.name} (${label.code}), Sent: ${sentCount}/${subscribers.length}, Location: ${(label.locations as any)?.name || 'unknown'}, IP: ${clientIp} at ${currentTimestamp}`);

    return res.json({
      success: true,
      sent_count: sentCount,
      total_subscribers: subscribers.length,
      label_name: label.name,
      last_send_timestamp: currentTimestamp,
      next_allowed_send: nextAllowedTime
    } as TeamSendResponse);

  } catch (error) {
    console.error('Team send error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as TeamSendResponse);
  }
};

// Team scan endpoint - lookup label by code/ID
export const teamScan = async (req: Request, res: Response) => {
  try {
    const { code, method }: TeamScanRequest = req.body;

    // Validate input
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Code is required'
      } as TeamScanResponse);
    }

    if (!method || !['scan', 'manual'].includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'Method must be either "scan" or "manual"'
      } as TeamScanResponse);
    }

    // Get client IP for rate limiting tracking
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

    // Get team session info from request (set by verifyTeamSession middleware)
    const teamSession = (req as any).teamSession;
    if (!teamSession) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as TeamScanResponse);
    }

    const locationId = teamSession.locationId;
    const trimmedCode = code.trim().toUpperCase();

    // Search for label by code or ID in the team's location
    console.log(`Searching for label: ${trimmedCode} (${method}) in location: ${locationId}`);
    const { data: labels, error: fetchError } = await supabaseAdmin
      .from('labels')
      .select(`
        id,
        code,
        name,
        synonyms,
        location_id,
        active,
        locations(id, name, slug)
      `)
      .eq('location_id', locationId)
      .or(`code.ilike.${trimmedCode}`)
      .limit(1);
    
    console.log('Labels query result:', { labels, fetchError });

    if (fetchError) {
      console.error('Error fetching label:', fetchError);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as TeamScanResponse);
    }

    if (!labels || labels.length === 0) {
      // Log failed scan attempt
      console.log(`Label not found - Code: ${trimmedCode} (${method}), Location: ${teamSession.locationName || 'unknown'}, IP: ${clientIp} at ${new Date().toISOString()}`);
      
      return res.status(404).json({
        success: false,
        message: 'Label not found'
      } as TeamScanResponse);
    }

    const label = labels[0];

    // Log successful scan
    console.log(`Label found - Code: ${trimmedCode} (${method}), Name: ${label.name}, Location: ${(label.locations as any)?.name || 'unknown'}, IP: ${clientIp} at ${new Date().toISOString()}`);

    // Get subscriber counts and send information
    let subscribersCount = 0;
    let sentCount = 0;
    let lastSent = undefined;
    let nextAllowed = undefined;

    try {
      // Get active subscribers count
      const { count: activeCount, error: optinsError } = await supabaseAdmin
        .from('optins')
        .select('*', { count: 'exact', head: true })
        .eq('location_id', locationId)
        .eq('label_id', label.id)
        .eq('status', 'active');

      if (!optinsError) {
        subscribersCount = activeCount || 0;
      } else {
        console.error('Optins query error:', optinsError);
      }

      // Get sent count and last send timestamp
      const { data: sends, error: sendsError } = await supabaseAdmin
        .from('sends')
        .select('count_sent, sent_at')
        .eq('location_id', locationId)
        .eq('label_id', label.id)
        .order('sent_at', { ascending: false })
        .limit(1);

      if (!sendsError && sends && sends.length > 0) {
        const lastSend = sends[0];
        sentCount = lastSend.count_sent || 0;
        lastSent = lastSend.sent_at;
        
        // Calculate next allowed time (3 hours after last send)
        if (lastSent) {
          const lastSentDate = new Date(lastSent);
          const nextAllowedDate = new Date(lastSentDate.getTime() + (3 * 60 * 60 * 1000)); // 3 hours
          nextAllowed = nextAllowedDate.toISOString();
        }
      } else if (sendsError) {
        console.error('Sends query error:', sendsError);
      }
    } catch (error) {
      console.error('Error fetching subscriber/send data:', error);
      // Continue with default values (0 counts, null timestamps)
    }

    return res.json({
      success: true,
      label: {
        id: label.id,
        code: label.code,
        name: label.name,
        synonyms: label.synonyms,
        location_id: label.location_id,
        location_name: (label.locations as any)?.name,
        active: label.active
      },
      subscribers_count: subscribersCount,
      sent_count: sentCount,
      last_sent: lastSent,
      next_allowed: nextAllowed
    } as TeamScanResponse);

  } catch (error) {
    console.error('Team scan error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as TeamScanResponse);
  }
};

// Team dashboard endpoint - get live team metrics
export const teamDashboard = async (req: Request, res: Response) => {
  try {
    // Get team session info from request (set by verifyTeamSession middleware)
    const teamSession = (req as any).teamSession;
    if (!teamSession) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as TeamDashboardResponse);
    }

    const locationId = teamSession.locationId;

    // Get client IP for logging
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

    console.log(`Dashboard request - Location ID: ${locationId}, IP: ${clientIp}`);

    // 1. Get active visitors count (subscribers with 'active' status)
    let activeVisitorsCount = 0;
    let pendingAlertsCount = 0;
    
    try {
      const { count: visitorsCount, error: visitorsError } = await supabaseAdmin
        .from('optins')
        .select('*', { count: 'exact', head: true })
        .eq('location_id', locationId)
        .eq('status', 'active');

      if (visitorsError) {
        console.error('Error fetching active visitors:', visitorsError);
        // Continue with default values if there's a permission error
        activeVisitorsCount = 0;
        pendingAlertsCount = 0;
      } else {
        activeVisitorsCount = visitorsCount || 0;
        pendingAlertsCount = visitorsCount || 0;
      }
    } catch (error) {
      console.error('Exception fetching active visitors:', error);
      activeVisitorsCount = 0;
      pendingAlertsCount = 0;
    }

    console.log(`Active visitors count: ${activeVisitorsCount}`);

    // 3. Get labels for this location
    const { data: labels, error: labelsError } = await supabaseAdmin
      .from('labels')
      .select(`
        id,
        code,
        name,
        location_id,
        active
      `)
      .eq('location_id', locationId)
      .eq('active', true);

    if (labelsError) {
      console.error('Error fetching labels:', labelsError);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as TeamDashboardResponse);
    }

    console.log(`Found ${labels?.length || 0} active labels`);

    // 4. Get waiting counts for each label
    const processedLabels = [];
    
    for (const label of labels || []) {
      let waitingCount = 0;
      let lastSendTimestamp = null;
      
      // Get waiting count for this label
      try {
        const { count: count, error: waitingError } = await supabaseAdmin
          .from('optins')
          .select('*', { count: 'exact', head: true })
          .eq('label_id', label.id)
          .eq('location_id', locationId)
          .eq('status', 'active');

        if (waitingError) {
          console.error(`Error fetching waiting count for label ${label.id}:`, waitingError);
          waitingCount = 0;
        } else {
          waitingCount = count || 0;
        }
      } catch (error) {
        console.error(`Exception fetching waiting count for label ${label.id}:`, error);
        waitingCount = 0;
      }

      // Get last send timestamp for this label
      try {
        const { data: lastSend, error: sendError } = await supabaseAdmin
          .from('sends')
          .select('sent_at')
          .eq('label_id', label.id)
          .eq('location_id', locationId)
          .order('sent_at', { ascending: false })
          .limit(1);

        if (sendError) {
          console.error(`Error fetching last send for label ${label.id}:`, sendError);
          lastSendTimestamp = null;
        } else {
          lastSendTimestamp = lastSend?.[0]?.sent_at || null;
        }
      } catch (error) {
        console.error(`Exception fetching last send for label ${label.id}:`, error);
        lastSendTimestamp = null;
      }

      processedLabels.push({
        id: label.id,
        code: label.code,
        name: label.name,
        waitingCount: waitingCount,
        lastSendTimestamp: lastSendTimestamp
      });
    }

    // Sort by waiting count and limit to top 10
    const topLabels = processedLabels
      .filter(label => label.waitingCount > 0)
      .sort((a, b) => b.waitingCount - a.waitingCount)
      .slice(0, 10);

    console.log(`Processed ${topLabels.length} labels with waiting subscribers`);

    // Log the dashboard request
    console.log(`Dashboard viewed - Location: ${teamSession.locationName || 'unknown'}, IP: ${clientIp}, Active Visitors: ${activeVisitorsCount || 0}, Pending Alerts: ${pendingAlertsCount || 0} at ${new Date().toISOString()}`);

    return res.json({
      success: true,
      metrics: {
        activeVisitors: activeVisitorsCount || 0,
        pendingAlerts: pendingAlertsCount || 0,
        topLabels: topLabels
      }
    } as TeamDashboardResponse);

  } catch (error) {
    console.error('Team dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as TeamDashboardResponse);
  }
};
