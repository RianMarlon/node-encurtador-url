import 'reflect-metadata';
import { container } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';
import { UrlShortenerPrismaRepository } from '@/modules/url-shortener/infra/database/prisma/url-shortener-prisma.repository';
import { CreateShortUrlUseCase } from '@/modules/url-shortener/application/usecases/create-short-url/create-short-url.usecase';
import { ResolveShortUrlUseCase } from '@/modules/url-shortener/application/usecases/resolve-short-url/resolve-short-url.usecase';
import { ListShortenedUrlsByUserIdUseCase } from '@/modules/url-shortener/application/usecases/list-shortened-urls-by-user-id/list-shortened-urls-by-user-id.usecase';
import { BcryptHashProvider } from '@/shared/infra/providers/hash/bcrypt-hash-provider';
import { HashProvider } from '@/shared/domain/interfaces/hash-provider.interface';
import { UserRepository } from '@/modules/user/domain/repositories/user.repository';
import { UserPrismaRepository } from '@/modules/user/infra/database/prisma/user-prisma.repository';
import { CreateUserUseCase } from '@/modules/user/application/usecases/create-user/create-user.usecase';
import { JsonWebTokenProvider } from '@/shared/infra/providers/jwt/jsonwebtoken-provider';
import { LoginUseCase } from '@/modules/auth/application/usecases/login/login.usecase';
import { JwtProvider } from '@/shared/domain/interfaces/jwt-provider.interface';
import { DeleteShortUrlByUrlKeyUseCase } from '@/modules/url-shortener/application/usecases/delete-short-url-by-url-key/delete-short-url-by-url-key.usecase';
import { UpdateOriginalUrlByUrlKeyUseCase } from '@/modules/url-shortener/application/usecases/update-original-url-by-url-key/update-original-url-by-url-key.usecase';
import { UserFacadeInterface } from '@/modules/user/facade/user.facade.interface';
import { UserFacade } from '@/modules/user/facade/user.facade';

const prismaClient = new PrismaClient();
container.registerInstance('PrismaClient', prismaClient);
container.registerSingleton<HashProvider>('HashProvider', BcryptHashProvider);
container.registerSingleton<JwtProvider>('JwtProvider', JsonWebTokenProvider);

container.registerSingleton<UrlShortenerRepository>(
  'UrlShortenerRepository',
  UrlShortenerPrismaRepository,
);

container.registerSingleton<UserRepository>('UserRepository', UserPrismaRepository);
container.registerSingleton<UserFacadeInterface>('UserFacade', UserFacade);

container.registerSingleton(CreateShortUrlUseCase);
container.registerSingleton(ResolveShortUrlUseCase);
container.registerSingleton(ListShortenedUrlsByUserIdUseCase);
container.registerSingleton(CreateUserUseCase);
container.registerSingleton(LoginUseCase);

container.registerSingleton(DeleteShortUrlByUrlKeyUseCase);
container.registerSingleton(UpdateOriginalUrlByUrlKeyUseCase);

export { container };
