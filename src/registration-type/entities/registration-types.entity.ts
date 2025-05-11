export class RegistrationType {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  availableFrom?: Date | null;
  availableUntil?: Date | null;
  maxSlots?: number | null;
  conferenceId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<RegistrationType>) {
    Object.assign(this, partial);
  }
}
