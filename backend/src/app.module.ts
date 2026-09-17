import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TrucksModule } from './trucks/trucks.module';

@Module({
  imports: [PrismaModule, AuthModule, TrucksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
