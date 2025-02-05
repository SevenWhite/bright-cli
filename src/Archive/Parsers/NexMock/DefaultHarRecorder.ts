import { HarRecorder } from './HarRecorder';
import { Helpers } from '../../../Utils';
import { CaptureHar } from '@neuralegion/capture-har';
import request, { Options, OptionsWithUrl } from 'request';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { inject, injectable } from 'tsyringe';
import { Stream } from 'stream';

export interface HarRecorderOptions {
  timeout: number;
  pool?: number;
  proxyUrl?: string;
  maxRedirects?: number;
}

export const HarRecorderOptions: unique symbol = Symbol('HarRecorderOptions');

@injectable()
export class DefaultHarRecorder implements HarRecorder {
  private readonly proxy: CaptureHar;
  private readonly pool: number;

  constructor(
    @inject(HarRecorderOptions)
    {
      pool = 250,
      timeout = 5000,
      proxyUrl,
      maxRedirects = 20
    }: HarRecorderOptions
  ) {
    this.pool = pool;
    this.proxy = new CaptureHar(
      request.defaults({
        timeout,
        maxRedirects,
        rejectUnauthorized: false,
        agent: proxyUrl ? new SocksProxyAgent(proxyUrl) : undefined
      })
    );
  }

  public async record(data: Options[]): Promise<string> {
    const requests: Options[] = Array.isArray(data) ? data : [data];
    const chunks: Options[][] = Helpers.split<Options[], Options>(
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
      (this.proxy.start(opt as OptionsWithUrl) as unknown as Stream)
        .once('end', resolve)
        .once('error', () => resolve())
    );
  }
}
