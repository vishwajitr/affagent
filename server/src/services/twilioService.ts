import twilio from 'twilio';
import { prisma } from '../utils/prisma';

const MAX_RETRIES = 2;

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || sid.startsWith('AC' + 'xxxx') || sid === 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
    throw new Error('TWILIO_ACCOUNT_SID is not configured. Please update your .env file.');
  }
  if (!token || token === 'your_auth_token_here') {
    throw new Error('TWILIO_AUTH_TOKEN is not configured. Please update your .env file.');
  }
  return twilio(sid, token);
}

export function validateTwilioConfig(): string | null {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const phone = process.env.TWILIO_PHONE_NUMBER;
  const baseUrl = process.env.BASE_URL;

  if (!sid || sid === 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
    return 'TWILIO_ACCOUNT_SID is not set in .env';
  }
  if (!sid.startsWith('AC')) {
    return `TWILIO_ACCOUNT_SID is invalid — it must start with "AC" (found: "${sid.substring(0, 4)}..."). Copy it from console.twilio.com → Account Info.`;
  }
  if (sid.length !== 34) {
    return `TWILIO_ACCOUNT_SID must be 34 characters long (found ${sid.length}). Copy it from console.twilio.com → Account Info.`;
  }
  if (!token || token === 'your_auth_token_here') {
    return 'TWILIO_AUTH_TOKEN is not set in .env';
  }
  if (token.length < 20) {
    return 'TWILIO_AUTH_TOKEN looks too short — copy the full token from console.twilio.com → Account Info.';
  }
  if (!phone || phone === '+1xxxxxxxxxx') {
    return 'TWILIO_PHONE_NUMBER is not set in .env';
  }
  if (!baseUrl || baseUrl === 'https://your-ngrok-or-domain.com') {
    return 'BASE_URL is not set in .env — run ngrok and paste the HTTPS URL here.';
  }
  if (!baseUrl.startsWith('https://')) {
    return 'BASE_URL must start with https:// — Twilio requires a public HTTPS URL (use ngrok).';
  }
  return null;
}

export interface CallOptions {
  contactId: string;
  campaignId: string;
  toPhone: string;
  script: string;
}

export async function initiateCall(options: CallOptions): Promise<string | null> {
  const { contactId, campaignId, toPhone, script } = options;
  const baseUrl = process.env.BASE_URL!;

  const voiceUrl = `${baseUrl}/voice?campaignId=${campaignId}&contactId=${contactId}`;
  const statusCallbackUrl = `${baseUrl}/call-status?contactId=${contactId}&campaignId=${campaignId}`;

  let lastError: Error | null = null;

  const client = getTwilioClient();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`📞 Calling ${toPhone} (attempt ${attempt}/${MAX_RETRIES})`);

      const call = await client.calls.create({
        to: toPhone,
        from: process.env.TWILIO_PHONE_NUMBER!,
        url: voiceUrl,
        statusCallback: statusCallbackUrl,
        statusCallbackMethod: 'POST',
        timeout: 30,
      });

      // Create call record
      await prisma.call.create({
        data: {
          contactId,
          campaignId,
          callSid: call.sid,
          callStatus: 'INITIATED',
        },
      });

      // Mark contact as CALLED
      await prisma.contact.update({
        where: { id: contactId },
        data: { status: 'CALLED' },
      });

      console.log(`✅ Call initiated: ${call.sid}`);
      return call.sid;
    } catch (err) {
      lastError = err as Error;
      console.error(`❌ Call attempt ${attempt} failed for ${toPhone}:`, lastError.message);

      if (attempt < MAX_RETRIES) {
        await sleep(2000 * attempt);
      }
    }
  }

  // All retries exhausted - mark as FAILED
  console.error(`💀 All ${MAX_RETRIES} attempts failed for contact ${contactId}`);

  await prisma.contact.update({
    where: { id: contactId },
    data: { status: 'FAILED', retryCount: MAX_RETRIES },
  });

  await prisma.call.create({
    data: {
      contactId,
      campaignId,
      callStatus: 'FAILED',
    },
  });

  return null;
}

// Voice options:
//   Indian English (female): Polly.Aditi  | Polly.Aditi-Neural (higher quality) | Polly.Raveena
//   US English (female):     Polly.Joanna | alice
//   UK English (female):     Polly.Amy
// Set TWILIO_VOICE in .env to override. Default: Polly.Aditi (Indian English)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getVoice(): any {
  return process.env.TWILIO_VOICE || 'Polly.Aditi';
}

export function generateVoiceResponse(script: string, campaignId: string, contactId: string): string {
  const baseUrl = process.env.BASE_URL!;
  const voice = getVoice();
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    numDigits: 1,
    action: `${baseUrl}/handle-input?campaignId=${campaignId}&contactId=${contactId}`,
    method: 'POST',
    timeout: 10,
  });

  gather.say({ voice }, script);

  twiml.say({ voice }, 'We did not receive your input. Goodbye.');
  twiml.hangup();

  return twiml.toString();
}

export function generateInputResponse(digit: string): string {
  const voice = getVoice();
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  if (digit === '1') {
    twiml.say({ voice }, 'Thank you for your interest! One of our team members will reach out to you soon. Have a great day!');
  } else if (digit === '2') {
    twiml.say({ voice }, 'We understand. We have removed you from our list. Have a wonderful day!');
  } else {
    twiml.say({ voice }, 'Invalid input received. Goodbye.');
  }

  twiml.hangup();
  return twiml.toString();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
