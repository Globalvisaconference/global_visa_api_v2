import { IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";

export class CreateSubscriptionDto {
  @IsString()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
