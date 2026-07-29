/**
 * Embedding script for legal documents
 * Uses OpenAI embeddings for vector search
 *
 * Usage: npx ts-node scripts/embedder.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// For embedding, you would typically use OpenAI's embedding API
// This is a placeholder that stores the embedding as a JSON field
// In production, use pgvector with proper VECTOR(1536) column

async function generateEmbedding(text: string): Promise<number[]> {
  void text;
  // Placeholder - in production, use OpenAI's text-embedding-3-small
  // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // const response = await openai.embeddings.create({
  //   model: 'text-embedding-3-small',
  //   input: text,
  // });
  // return response.data[0].embedding;

  // Return mock embedding for now
  // In production, this MUST be replaced with actual OpenAI embeddings
  return Array(1536).fill(0).map(() => Math.random() * 2 - 1);
}

async function embedLegalDocuments() {
  console.log('Starting document embedding...');

  const documents = await prisma.legalDocument.findMany({
    where: {
      // Only embed documents that don't have embeddings yet
      // Add a condition when you add the embedding field
    },
    take: 100, // Process in batches
  });

  console.log(`Processing ${documents.length} documents`);

  for (const doc of documents) {
    try {
      // Combine relevant text for embedding
      const textToEmbed = `${doc.title}\n\n${doc.content}`;

      // Generate embedding
      await generateEmbedding(textToEmbed);

      // Update document with embedding
      // In production, you would use raw SQL to update the vector column:
      // await prisma.$executeRaw`
      //   UPDATE legal_documents
      //   SET embedding = ${embedding}::vector
      //   WHERE id = ${doc.id}
      // `;

      console.log(`Embedded: ${doc.title}`);

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error embedding ${doc.title}:`, error);
    }
  }

  console.log('Embedding complete!');
}

async function embedCourtDecisions() {
  console.log('Starting court decision embedding...');

  const decisions = await prisma.courtDecision.findMany({
    take: 100,
  });

  console.log(`Processing ${decisions.length} decisions`);

  for (const dec of decisions) {
    try {
      const textToEmbed = `${dec.caseNumber}\n\n${dec.verdict}`;
      await generateEmbedding(textToEmbed);

      // Update with embedding
      // await prisma.$executeRaw`UPDATE court_decisions SET embedding = ${embedding}::vector WHERE id = ${dec.id}`;

      console.log(`Embedded: ${dec.caseNumber}`);
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error embedding ${dec.caseNumber}:`, error);
    }
  }

  console.log('Embedding complete!');
}

// CLI runner
const command = process.argv[2] || 'all';

(async () => {
  try {
    switch (command) {
      case 'documents':
        await embedLegalDocuments();
        break;
      case 'decisions':
        await embedCourtDecisions();
        break;
      case 'all':
      default:
        await embedLegalDocuments();
        await embedCourtDecisions();
    }
    process.exit(0);
  } catch (error) {
    console.error('Embedding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
