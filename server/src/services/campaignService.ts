import { prisma } from '../utils/prisma';
import { initiateCall } from './twilioService';

const CALL_DELAY_MS = 1000; // 1 second between calls to avoid rate limiting

export async function startCampaignCalls(campaignId: string): Promise<void> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) throw new Error(`Campaign ${campaignId} not found`);

  const contacts = await prisma.contact.findMany({
    where: { status: 'NOT_CALLED' },
  });

  if (contacts.length === 0) {
    console.log('ℹ️ No contacts with NOT_CALLED status found');
    return;
  }

  console.log(`🚀 Starting campaign "${campaign.name}" for ${contacts.length} contacts`);

  // Fire calls asynchronously with staggered delay to avoid rate limits
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
