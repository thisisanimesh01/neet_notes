export type SubjectWithData = {
  id: string;
  name: string;
  slug: string;
  categories: {
    id: string;
    name: string;
    notes: unknown[];
  }[];
};

export type NoteCardData = {
  id: string;
  title: string;
  chapterName: string;
  description: string;
  price: number;
  pageCount: number;
  status: string;
  subject: { name: string; slug: string };
  category: { name: string; slug: string };
};
