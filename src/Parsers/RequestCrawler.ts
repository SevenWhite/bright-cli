// @ts-ignore
import { CaptureHar } from 'capture-har';
import * as request from 'request';
import { CoreOptions, Options } from 'request';

export class RequestCrawler {
  private readonly options: CoreOptions;
  private readonly proxy: CaptureHar;
  private readonly pool: number;

  constructor({
                pool = 250,
                timeout = 5000,
                maxRedirects = 20
              }: {
    timeout: number;
    pool?: number;
    maxRedirects?: number;
  }) {
    this.options = {
      timeout,
      maxRedirects,
      strictSSL: false
    };
    this.pool = pool;
    this.proxy = new CaptureHar(request.defaults(this.options));
  }

  public async parse(data: Options | Options[]): Promise<string> {
    const requests: Options[] = Array.isArray(data) ? data : [data];
    const chunks: Options[][] = this.splitByChunks<Options[], Options>(
      requests,
      this.pool
    );

    await chunks.reduce(
      (total: Promise<void>, partOfRequests: Options[]) =>
        total.then(
          () =>
            Promise.all<void>(
              partOfRequests.map((opt: Options) => this.executeRequest(opt))
            ) as any
        ),
      Promise.resolve()
    );

    return JSON.stringify(this.proxy.stop());
  }

  private executeRequest(opt: Options): Promise<void> {
    return new Promise<void>((resolve) =>
      this.proxy
        .start(opt)
        .once('end', resolve)
        .once('error', (err: Error) => resolve())
    );
  }

  private splitByChunks<T extends R[], R>(array: T, count: number): R[][] {
    if (!Array.isArray(array)) {
      throw new TypeError(`First argument must be an instance of Array.`);
    }

    const countItemInChunk: number = Math.ceil(array.length / count);

    return Array(countItemInChunk)
      .fill(null)
      .map(
        (_value: string, i: number) =>
          array.slice(i * count, i * count + count) as R[]
      );
  }
}
