export class Post {
  id: string;
  title: string;
  content: string;
  tags: string[];
  published: boolean;
  short_intro?: string | null;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Post>) {
    Object.assign(this, partial);
  }
}
