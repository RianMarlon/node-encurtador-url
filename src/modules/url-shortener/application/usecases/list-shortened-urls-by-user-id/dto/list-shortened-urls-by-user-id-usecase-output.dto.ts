export interface ShortenedUrlDTO {
  urlKey: string;
  shortUrl: string;
  originalUrl: string;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListShortenedUrlsByUserIdUseCaseOutputDTO {
  data: ShortenedUrlDTO[];
}
