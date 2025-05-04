import { inject, injectable } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

import { User } from '@/modules/user/domain/entities/user.entity';
import { UserRepository } from '@/modules/user/domain/repositories/user.repository';

@injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(
    @inject('PrismaClient')
    private readonly prisma: PrismaClient,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const userData = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!userData) {
      return null;
    }

    return new User({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    });
  }

  async create(entity: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: entity.id,
        name: entity.name,
        email: entity.email,
        password: entity.password,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      },
    });
  }
}
