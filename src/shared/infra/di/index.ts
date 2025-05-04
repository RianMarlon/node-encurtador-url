import 'reflect-metadata';
import { container } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { UrlShortenerPrismaRepository } from '@/modules/url-shortener/infra/database/prisma/url-shortener-prisma.repository';
import { CreateShortUrlUseCase } from '@/modules/url-shortener/application/usecases/create-short-url/create-short-url.usecase';
import { ResolveShortUrlUseCase } from '@/modules/url-shortener/application/usecases/resolve-short-url/resolve-short-url.usecase';
import { BcryptHashProvider } from '@/shared/providers/hash/implementations/bcrypt-hash-provider';
import { HashProvider } from '@/shared/providers/hash/interfaces/hash-provider.interface';

const prismaClient = new PrismaClient();
container.registerInstance('PrismaClient', prismaClient);
container.registerSingleton<HashProvider>('HashProvider', BcryptHashProvider);

container.registerSingleton<UrlShortenerRepository>(
  'UrlShortenerRepository',
  UrlShortenerPrismaRepository,
);

container.registerSingleton(CreateShortUrlUseCase);
container.registerSingleton(ResolveShortUrlUseCase);

export { container };
