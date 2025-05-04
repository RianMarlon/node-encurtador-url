import 'reflect-metadata';
import { container } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { UrlShortenerPrismaRepository } from '@/modules/url-shortener/infra/database/prisma/url-shortener-prisma.repository';
import { CreateShortUrlUseCase } from '@/modules/url-shortener/application/usecases/create-short-url/create-short-url.usecase';
import { ResolveShortUrlUseCase } from '@/modules/url-shortener/application/usecases/resolve-short-url/resolve-short-url.usecase';

const prismaClient = new PrismaClient();
container.registerInstance('PrismaClient', prismaClient);

container.registerSingleton<UrlShortenerRepository>(
  'UrlShortenerRepository',
  UrlShortenerPrismaRepository,
);

container.registerSingleton(CreateShortUrlUseCase);
container.registerSingleton(ResolveShortUrlUseCase);

export { container };
