import { inject, injectable } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

import { UrlShortener } from '@/modules/url-shortener/domain/entities/url-shortener.entity';
import { UrlShortenerRepository } from '@/modules/url-shortener/domain/repositories/url-shortener.repository';

@injectable()
export class UrlShortenerPrismaRepository implements UrlShortenerRepository {
  constructor(
    @inject('PrismaClient')
    private readonly prisma: PrismaClient,
  ) {}

  async findByUrlKey(urlKey: string): Promise<UrlShortener | null> {
    const urlShortenerData = await this.prisma.urlShortener.findUnique({
      where: {
        urlKey,
      },
    });

    if (!urlShortenerData) {
      return null;
    }

    return new UrlShortener({
      id: urlShortenerData.id,
      urlKey: urlShortenerData.urlKey,
      originalUrl: urlShortenerData.originalUrl,
      clickCount: urlShortenerData.clickCount,
      createdAt: urlShortenerData.createdAt,
      updatedAt: urlShortenerData.updatedAt,
    });
  }

  async create(entity: UrlShortener, userId?: string): Promise<void> {
    await this.prisma.urlShortener.create({
      data: {
        id: entity.id,
        urlKey: entity.urlKey,
        originalUrl: entity.originalUrl,
        clickCount: entity.clickCount,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        userId: userId ? userId : null,
      },
    });
  }

  async update(entity: UrlShortener): Promise<void> {
    await this.prisma.urlShortener.update({
      where: {
        id: entity.id,
      },
      data: {
        originalUrl: entity.originalUrl,
        clickCount: entity.clickCount,
        updatedAt: entity.updatedAt,
      },
    });
  }
}
