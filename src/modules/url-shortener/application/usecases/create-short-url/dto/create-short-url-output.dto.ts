export interface CreateShortUrlOutputDTO {
  id: string;
  urlKey: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
