export class Report {
  id: string;
  userId: string;
  documentId: string;
  successRate: number;
  reportDetails: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Report>) {
    Object.assign(this, partial);
  }
}
