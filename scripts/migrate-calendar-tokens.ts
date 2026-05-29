import { prisma } from '@/lib/db';
import { encrypt, decrypt } from '@/lib/crypto/tokenEncryption';

async function main() {
  console.log('Starting CalendarToken encryption migration...');

  const legacyTokens = await prisma.calendarToken.findMany({
    where: {
      isLegacy: true,
    },
  });

  console.log(`Found ${legacyTokens.length} legacy tokens to migrate.`);

  let migratedCount = 0;

  for (const token of legacyTokens) {
    try {
      console.log(`Migrating token ID ${token.id} for candidate ${token.candidateId} (${token.provider})...`);

      // Decrypt (which acts as a no-op if it's plaintext)
      const decryptedAccess = decrypt(token.accessToken);
      const decryptedRefresh = token.refreshToken ? decrypt(token.refreshToken) : null;

      // Encrypt using the standard encryption helper
      const encryptedAccess = encrypt(decryptedAccess);
      const encryptedRefresh = decryptedRefresh ? encrypt(decryptedRefresh) : null;

      await prisma.calendarToken.update({
        where: {
          id: token.id,
        },
        data: {
          accessToken: encryptedAccess,
          refreshToken: encryptedRefresh,
          encryptionVersion: 1,
          encryptionKeyId: 'primary',
          isLegacy: false,
          migratedAt: new Date(),
        },
      });

      migratedCount++;
    } catch (error) {
      console.error(`❌ Failed to migrate token ID ${token.id}:`, error);
    }
  }

  console.log(`Migration complete. Successfully migrated ${migratedCount} of ${legacyTokens.length} tokens.`);
}

main()
  .catch((e) => {
    console.error('Migration script failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
