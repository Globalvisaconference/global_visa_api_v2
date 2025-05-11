import { Module } from '@nestjs/common';
import { RegistrationTypesController } from './registration-types.controller';
import { RegistrationTypesService } from './registration-types.service';

@Module({
  controllers: [RegistrationTypesController],
  providers: [RegistrationTypesService],
})
export class RegistrationTypesModule {}
