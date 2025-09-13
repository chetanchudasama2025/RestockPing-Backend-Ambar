import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const requiredVars = [
	'TWILIO_ACCOUNT_SID',
	'TWILIO_AUTH_TOKEN'
];

const missing = requiredVars.filter((k) => !process.env[k] || !String(process.env[k]).trim());
if (missing.length > 0) {
	console.warn(
		`[twilio] Missing environment variables: ${missing.join(', ')}. SMS features will be disabled until configured.`
	);
}

let client: ReturnType<typeof twilio> | null = null;
if (missing.length === 0) {
	client = twilio(process.env.TWILIO_ACCOUNT_SID as string, process.env.TWILIO_AUTH_TOKEN as string);
}

export const isTwilioConfigured = () => client !== null;

type SendSmsOptions = {
	to: string;
	body: string;
	from?: string;
	messagingServiceSid?: string;
	statusCallback?: string;
};

// Phone number validation
export const validatePhoneNumber = (phone: string): boolean => {
	// Remove all non-digit characters except +
	const cleaned = phone.replace(/[^\d+]/g, '');
	
	// Check if it starts with + and has 10-15 digits after
	if (cleaned.startsWith('+')) {
		const digits = cleaned.slice(1);
		return /^\d{10,15}$/.test(digits);
	}
	
	// Check if it's a valid US number (10 digits)
	if (/^\d{10}$/.test(cleaned)) {
		return true;
	}
	
	// Check if it's a valid international number (10-15 digits)
	return /^\d{10,15}$/.test(cleaned);
};

export const sendSms = async (
	toOrOptions: string | SendSmsOptions,
	bodyMaybe?: string
) => {
	if (!client) {
		throw new Error('Twilio is not configured');
	}

	let to: string;
	let body: string;
	let from: string | undefined;
	let messagingServiceSid: string | undefined;
	let statusCallback: string | undefined;

	if (typeof toOrOptions === 'string') {
		to = toOrOptions;
		body = bodyMaybe as string;
		from = process.env.TWILIO_FROM_NUMBER as string | undefined;
		messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID as string | undefined;
		statusCallback = process.env.TWILIO_STATUS_CALLBACK_URL as string | undefined;
	} else {
		({ to, body, from, messagingServiceSid, statusCallback } = toOrOptions);
		from = from ?? (process.env.TWILIO_FROM_NUMBER as string | undefined);
		messagingServiceSid = messagingServiceSid ?? (process.env.TWILIO_MESSAGING_SERVICE_SID as string | undefined);
		statusCallback = statusCallback ?? (process.env.TWILIO_STATUS_CALLBACK_URL as string | undefined);
	}

	if (!to || !body) {
		throw new Error('Parameter validation failed: `to` and `body` are required');
	}

	// Validate phone number
	if (!validatePhoneNumber(to)) {
		throw new Error('Invalid phone number format. Please provide a valid phone number.');
	}

	const createArgs: any = { to, body };
	if (messagingServiceSid) {
		createArgs.messagingServiceSid = messagingServiceSid;
	} else if (from) {
		createArgs.from = from;
	} else {
		throw new Error('No `from` number or `messagingServiceSid` provided/configured');
	}

	// Add status callback if provided
	if (statusCallback) {
		createArgs.statusCallback = statusCallback;
	}

	return client.messages.create(createArgs);
};

export default client;


