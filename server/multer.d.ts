declare module "multer" {
  type Callback<T> = (error: Error | null, value: T) => void;

  interface DiskStorageOptions {
    destination?: (req: any, file: any, cb: Callback<string>) => void;
    filename?: (req: any, file: any, cb: Callback<string>) => void;
  }

  interface StorageEngine {}

  interface MulterInstance {
    single(fieldName: string): any;
  }

  function multer(options?: { storage?: StorageEngine }): MulterInstance;

  namespace multer {
    function diskStorage(options: DiskStorageOptions): StorageEngine;
  }

  export = multer;
}
