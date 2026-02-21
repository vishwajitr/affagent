import { prisma } from '../utils/prisma';
import { initiateCall } from './twilioService';

const CALL_DELAY_MS = 1000; // 1 second between calls to avoid rate limiting

export async function startCampaignCalls(campaignId: string, userId: string): Promise<void> {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, userId },
  });

  if (!campaign) throw new Error(`Campaign ${campaignId} not found`);

  // Only call contacts that belong to this user
  const contacts = await prisma.contact.findMany({
    where: { userId, status: 'NOT_CALLED' },
  });

  if (contacts.length === 0) {
    console.log('ℹ️ No contacts with NOT_CALLED status found');
    return;
  }

  console.log(`🚀 Starting campaign "${campaign.name}" for ${contacts.length} contacts`);

  (async () => {
    for (const contact of contacts) {
      await initiateCall({
        contactId: contact.id,
        campaignId: campaign.id,
        toPhone: contact.phone,
        script: campaign.script,
      });
      await sleep(CALL_DELAY_MS);
    }
    console.log(`✅ Campaign "${campaign.name}" completed all calls`);
  })().catch((err) => {
    console.error('Campaign call loop error:', err);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
