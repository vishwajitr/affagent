import { PrismaClient, ContactStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.call.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.campaign.deleteMany();

  // Create campaigns
  const campaign1 = await prisma.campaign.create({
    data: {
      name: 'Q1 Product Launch',
      script:
        'Hello! This is a message from Aff Agent. We are excited to tell you about our new product launch. Press 1 if you are interested in learning more. Press 2 if you would like to be removed from our list.',
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      name: 'Summer Promotion',
      script:
        'Hi there! We have an exclusive summer offer just for you. Press 1 if you want to hear about this amazing deal. Press 2 if you are not interested.',
    },
  });

  // Create contacts
  const contacts = [
    { name: 'Alice Johnson', phone: '+14155552671', status: ContactStatus.NOT_CALLED },
    { name: 'Bob Smith', phone: '+14155552672', status: ContactStatus.INTERESTED },
    { name: 'Carol White', phone: '+14155552673', status: ContactStatus.NOT_INTERESTED },
    { name: 'David Brown', phone: '+14155552674', status: ContactStatus.NO_ANSWER },
    { name: 'Eve Davis', phone: '+14155552675', status: ContactStatus.NOT_CALLED },
    { name: 'Frank Miller', phone: '+14155552676', status: ContactStatus.CALLED },
    { name: 'Grace Wilson', phone: '+14155552677', status: ContactStatus.NOT_CALLED },
    { name: 'Henry Moore', phone: '+14155552678', status: ContactStatus.FAILED },
    { name: 'Iris Taylor', phone: '+14155552679', status: ContactStatus.INTERESTED },
    { name: 'Jack Anderson', phone: '+14155552680', status: ContactStatus.NOT_CALLED },
  ];

  const createdContacts = await Promise.all(
    contacts.map((c) => prisma.contact.create({ data: c }))
  );

  // Create some call records
  await prisma.call.create({
    data: {
      contactId: createdContacts[1].id,
      campaignId: campaign1.id,
      callStatus: 'ANSWERED',
      userInput: '1',
      duration: 45,
    },
  });

  await prisma.call.create({
    data: {
      contactId: createdContacts[2].id,
      campaignId: campaign1.id,
      callStatus: 'ANSWERED',
      userInput: '2',
      duration: 30,
    },
  });

  await prisma.call.create({
    data: {
      contactId: createdContacts[3].id,
      campaignId: campaign2.id,
      callStatus: 'FAILED',
      duration: 0,
    },
  });

  await prisma.call.create({
    data: {
      contactId: createdContacts[8].id,
      campaignId: campaign2.id,
      callStatus: 'ANSWERED',
      userInput: '1',
      duration: 52,
    },
  });

  console.log(`✅ Seeded:`);
  console.log(`   - ${2} campaigns`);
  console.log(`   - ${createdContacts.length} contacts`);
  console.log(`   - ${4} call records`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
