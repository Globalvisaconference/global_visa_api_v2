import { Report } from 'src/reports/entities/report.entity';

export class Document {
  id: string;
  name?: string | null;
  fileUrl?: string | null;
  documentType?: string | null;
  userId: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  Report?: Report | null;

  constructor(partial: Partial<Document>) {
    Object.assign(this, partial);
  }
}
