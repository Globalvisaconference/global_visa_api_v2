import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ConferencesModule } from './conference/conferences.module';
import { RegistrationTypesModule } from './registration-type/registration-types.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { PaymentsModule } from './payments/payments.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { FileUploadsModule } from './file-uploads/file-uploads.module';
import { ReportsModule } from './reports/reports.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { PostModule } from './post/post.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    AuthModule,
    UsersModule,
    PrismaModule,
    ConferencesModule,
    RegistrationTypesModule,
    RegistrationsModule,
    PaymentsModule,
    DocumentsModule,
    FileUploadsModule,
    ReportsModule,
    SubscriptionModule,
    PostModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService],
})
export class AppModule {}
