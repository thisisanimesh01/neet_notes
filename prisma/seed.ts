import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const biology = await prisma.subject.upsert({
    where: { slug: "biology" },
    update: {},
    create: { name: "Biology", slug: "biology" },
  });

  const chemistry = await prisma.subject.upsert({
    where: { slug: "chemistry" },
    update: {},
    create: { name: "Chemistry", slug: "chemistry" },
  });

  const biologyCategories = [
    { name: "Botany", slug: "botany" },
    { name: "Zoology", slug: "zoology" },
  ];

  const chemistryCategories = [
    { name: "Physical Chemistry", slug: "physical-chemistry" },
    { name: "Organic Chemistry", slug: "organic-chemistry" },
    { name: "Inorganic Chemistry", slug: "inorganic-chemistry" },
  ];

  for (const category of biologyCategories) {
    await prisma.category.upsert({
      where: { subjectId_slug: { subjectId: biology.id, slug: category.slug } },
      update: {},
      create: { subjectId: biology.id, ...category },
    });
  }

  for (const category of chemistryCategories) {
    await prisma.category.upsert({
      where: { subjectId_slug: { subjectId: chemistry.id, slug: category.slug } },
      update: {},
      create: { subjectId: chemistry.id, ...category },
    });
  }

  const adminUsername = (process.env.ADMIN_USERNAME || "admin123").replace(/\s+/g, "").trim();
  const passwordFromEnv = (process.env.ADMIN_PASSWORD || "12345@admin").trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH || (await bcrypt.hash(passwordFromEnv, 10));

  await prisma.admin.upsert({
    where: { username: adminUsername },
    update: { passwordHash },
    create: {
      username: adminUsername,
      passwordHash,
    },
  });

  console.log("Seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
