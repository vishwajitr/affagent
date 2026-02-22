import twilio from 'twilio';
import { prisma } from '../utils/prisma';

const MAX_RETRIES = 2;

export interface UserTwilioCreds {
  twilioSid: string;
  twilioToken: string;
  twilioPhone: string;
}

export function validateUserTwilioConfig(creds: Partial<UserTwilioCreds>): string | null {
  const { twilioSid, twilioToken, twilioPhone } = creds;

  if (!twilioSid) return 'Twilio Account SID is not set. Go to Profile → Twilio Integration to add it.';
  if (!twilioSid.startsWith('AC')) return 'Twilio Account SID must start with "AC". Check your Twilio console.';
  if (twilioSid.length !== 34) return `Twilio Account SID must be 34 characters (found ${twilioSid.length}).`;
  if (!twilioToken) return 'Twilio Auth Token is not set. Go to Profile → Twilio Integration to add it.';
  if (twilioToken.length < 20) return 'Twilio Auth Token looks too short. Copy the full token from twilio.com/console.';
  if (!twilioPhone) return 'Twilio Phone Number is not set. Go to Profile → Twilio Integration to add it.';
  if (!twilioPhone.startsWith('+')) return 'Twilio Phone Number must be in E.164 format (e.g. +919876543210).';

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl || !baseUrl.startsWith('https://')) {
    return 'BASE_URL is not configured on the server. Contact support.';
  }

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getVoice(): any {
  return process.env.TWILIO_VOICE || 'Polly.Aditi';
}

export interface CallOptions {
  contactId: string;
  campaignId: string;
  toPhone: string;
  script: string;
  creds: UserTwilioCreds;
}

export async function initiateCall(options: CallOptions): Promise<string | null> {
  const { contactId, campaignId, toPhone, script, creds } = options;
  const baseUrl = process.env.BASE_URL!;

  const voiceUrl = `${baseUrl}/voice?campaignId=${campaignId}&contactId=${contactId}`;
  const statusCallbackUrl = `${baseUrl}/call-status?contactId=${contactId}&campaignId=${campaignId}`;

  const client = twilio(creds.twilioSid, creds.twilioToken);
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`📞 Calling ${toPhone} (attempt ${attempt}/${MAX_RETRIES})`);

      const call = await client.calls.create({
        to: toPhone,
        from: creds.twilioPhone,
        url: voiceUrl,
        statusCallback: statusCallbackUrl,
        statusCallbackMethod: 'POST',
        timeout: 20,
      });

      await prisma.call.create({
        data: { contactId, campaignId, callSid: call.sid, callStatus: 'INITIATED' },
      });

      await prisma.contact.update({
        where: { id: contactId },
        data: { status: 'CALLED' },
      });

      console.log(`✅ Call initiated: ${call.sid}`);
      return call.sid;
    } catch (err) {
      lastError = err as Error;
      console.error(`❌ Call attempt ${attempt} failed for ${toPhone}:`, lastError.message);
      if (attempt < MAX_RETRIES) await sleep(2000 * attempt);
    }
  }

  console.error(`💀 All ${MAX_RETRIES} attempts failed for contact ${contactId}`);

  await prisma.contact.update({
    where: { id: contactId },
    data: { status: 'FAILED', retryCount: MAX_RETRIES },
  });

  await prisma.call.create({
    data: { contactId, campaignId, callStatus: 'FAILED' },
  });

  return null;
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
