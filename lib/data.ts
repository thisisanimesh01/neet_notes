import { db } from "@/lib/db";

export const NOTE_PRICE = 49;

type PublicNote = {
  id: string;
  title: string;
  description: string;
  chapterName: string;
  pageCount: number;
  subject: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string };
  status: string;
  price: number;
  createdAt: Date;
  deletedAt: Date | null;
};

export async function getPublishedNotes() {
  return db.note.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
    },
    include: {
      subject: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPublicSubjects() {
  const notes = (await getPublishedNotes()) as PublicNote[];
  const tree = new Map<string, { id: string; name: string; categories: Map<string, { id: string; name: string; notes: PublicNote[] }> }>();

  for (const note of notes) {
    const subject = note.subject;
    if (!tree.has(subject.slug)) {
      tree.set(subject.slug, {
        id: subject.id,
        name: subject.name,
        categories: new Map(),
      });
    }

    const subjectBucket = tree.get(subject.slug)!;
    const categoryKey = note.category.slug;
    if (!subjectBucket.categories.has(categoryKey)) {
      subjectBucket.categories.set(categoryKey, {
        id: note.category.id,
        name: note.category.name,
        notes: [],
      });
    }

    subjectBucket.categories.get(categoryKey)!.notes.push(note);
  }

  return Array.from(tree.values()).map((subject) => ({
    id: subject.id,
    name: subject.name,
    categories: Array.from(subject.categories.values()),
  }));
}

export async function getSubjectCount(subjectName: string) {
  return db.note.count({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      subject: { name: subjectName },
    },
  });
}

export async function getNoteById(id: string) {
  return db.note.findUnique({
    where: { id },
    include: { subject: true, category: true },
  });
}

export async function getAllNotesAdmin() {
  return db.note.findMany({
    include: { subject: true, category: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDashboardStats() {
  const [totalNotes, publishedNotes, draftNotes, orders, successfulPayments, revenue] = await Promise.all([
    db.note.count(),
    db.note.count({ where: { status: "PUBLISHED" } }),
    db.note.count({ where: { status: "DRAFT" } }),
    db.purchase.count(),
    db.purchase.count({ where: { status: "PAID" } }),
    db.purchase.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" },
    }),
  ]);

  return {
    totalNotes,
    publishedNotes,
    draftNotes,
    orders,
    successfulPayments,
    revenue: revenue._sum.amount ?? 0,
  };
}

export async function getOrdersAdmin() {
  return db.purchase.findMany({
    include: { note: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(id: string) {
  return db.purchase.findUnique({
    where: { id },
    include: { note: true },
  });
}

export async function getCustomerPurchaseForNote(noteId: string, email?: string) {
  return db.purchase.findFirst({
    where: {
      noteId,
      status: "PAID",
      ...(email ? { customerEmail: email } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getDefaultSubjectOptions() {
  return [
    { id: "biology", name: "Biology", categories: ["Botany", "Zoology"] },
    { id: "chemistry", name: "Chemistry", categories: ["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry"] },
  ];
}

export function getCategoryOptionsForSubject(subjectName: string) {
  const options = getDefaultSubjectOptions();
  const match = options.find((item) => item.name === subjectName);
  return match ? match.categories : [];
}

export async function ensureSeededData() {
  const subjects = [
    { name: "Biology", slug: "biology" },
    { name: "Chemistry", slug: "chemistry" },
  ];

  for (const subject of subjects) {
    await db.subject.upsert({
      where: { slug: subject.slug },
      update: {},
      create: subject,
    });
  }

  const biology = await db.subject.findUnique({ where: { slug: "biology" } });
  const chemistry = await db.subject.findUnique({ where: { slug: "chemistry" } });

  const categorySeeds = [
    { subjectId: biology!.id, name: "Botany", slug: "botany" },
    { subjectId: biology!.id, name: "Zoology", slug: "zoology" },
    { subjectId: chemistry!.id, name: "Physical Chemistry", slug: "physical-chemistry" },
    { subjectId: chemistry!.id, name: "Organic Chemistry", slug: "organic-chemistry" },
    { subjectId: chemistry!.id, name: "Inorganic Chemistry", slug: "inorganic-chemistry" },
  ];

  for (const entry of categorySeeds) {
    await db.category.upsert({
      where: { subjectId_slug: { subjectId: entry.subjectId, slug: entry.slug } },
      update: {},
      create: entry,
    });
  }
}

export async function getRecentPublishedNotes(limit = 4) {
  const notes = await getPublishedNotes();
  return notes.slice(0, limit);
}

export async function getTopSellingNotes(limit = 5) {
  const notes = await db.note.findMany({
    where: { status: "PUBLISHED", purchases: { some: { status: "PAID" } } },
    include: { purchases: true, subject: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  return notes
    .map((note: typeof notes[number]) => ({
      ...note,
      sales: note.purchases.filter((purchase: typeof note.purchases[number]) => purchase.status === "PAID").length,
    }))
    .sort((a: { sales: number }, b: { sales: number }) => b.sales - a.sales)
    .slice(0, limit);
}
