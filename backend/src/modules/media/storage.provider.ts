export interface StorageProvider {
  upload(file: Buffer, filename: string): Promise<string>;
  delete(url: string): Promise<void>;
}
