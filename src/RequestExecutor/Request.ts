import { Helpers, logger } from '../Utils';
import { URL } from 'url';
import { readFile } from 'fs';
import { basename, extname } from 'path';
import { promisify } from 'util';
import { createSecureContext } from 'tls';

export interface RequestOptions {
  method?: string;
  url: string;
  headers: Record<string, string | string[]>;
  pfx?: Buffer | string;
  ca?: Buffer | string;
  body?: string;
  passphrase?: string;
  correlationIdRegex?: string | RegExp;
}

export interface Cert {
  path: string;
  hostname: string;
  passphrase?: string;
}

export class Request {
  public readonly url: string;
  public readonly body?: string;
  public readonly correlationIdRegex?: RegExp;

  private _method?: string;

  get method(): string {
    return this._method;
  }

  private _headers: Record<string, string | string[]>;

  get headers(): Record<string, string | string[]> {
    return this._headers;
  }

  private _ca?: Buffer;

  get ca(): Buffer {
    return this._ca;
  }

  private _pfx?: Buffer;

  get pfx(): Buffer {
    return this._pfx;
  }

  private _passphrase?: string;

  get passphrase(): string {
    return this._passphrase;
  }

  constructor({
    method,
    url,
    body,
    ca,
    pfx,
    passphrase,
    correlationIdRegex,
    headers = {}
  }: RequestOptions) {
    this._method = method?.toUpperCase() ?? 'GET';

    if (!url) {
      throw new Error('Url must be declared explicitly.');
    }

    try {
      this.url = new URL(url).toString();
    } catch {
      throw new Error('Invalid URL.');
    }

    if (body && typeof body !== 'string') {
      throw new Error('Body must be string.');
    }

    this.body = body;

    if (correlationIdRegex) {
      try {
        this.correlationIdRegex = new RegExp(correlationIdRegex, 'i');
      } catch {
        // noop
      }
    }

    this._headers = headers;

    if (pfx) {
      this._pfx = Buffer.from(pfx);
    }

    if (ca) {
      this._ca = Buffer.from(ca);
    }

    this._passphrase = passphrase;
  }

  public setHeaders(headers: Record<string, string | string[]>): void {
    this._headers = {
      ...this._headers,
      ...(headers ?? {})
    };
  }

  public async setCerts(certs: Cert[]): Promise<void> {
    const { hostname } = new URL(this.url);

    const cert: Cert | undefined = certs.find((x) =>
      this.matchHostname(hostname, x.hostname)
    );

    if (!cert) {
      logger.warn(`Warning: certificate for ${hostname} not found.`);

      return;
    }

    await this.loadCert(cert);
  }

  public toJSON(): RequestOptions {
    return {
      url: this.url,
      body: this.body,
      method: this._method,
      headers: this._headers,
      passphrase: this._passphrase,
      ca: this._ca?.toString('utf8'),
      pfx: this._pfx?.toString('utf8'),
      correlationIdRegex: this.correlationIdRegex
    };
  }

  private async loadCert({ path, passphrase }: Cert): Promise<void> {
    let cert: Buffer | undefined;

    try {
      cert = await promisify(readFile)(path);
    } catch (e) {
      logger.warn(`Warning: certificate ${path} not found.`);
    }

    const ext = extname(path);
    const name = basename(path);

    switch (ext) {
      case '.pem':
      case '.crt':
      case '.ca':
        this._ca = cert;
        break;
      case '.pfx':
        this.assertPassphrase(name, cert, passphrase);
        this._pfx = cert;
        this._passphrase = passphrase;
        break;
      default:
        logger.warn(`Warning: certificate of type "${ext}" does not support.`);
    }
  }

  private matchHostname(hostname: string, wildcard: string): boolean {
    return (
      wildcard === hostname || Helpers.wildcardToRegExp(wildcard).test(hostname)
    );
  }

  private assertPassphrase(
    name: string,
    pfx: Buffer,
    passphrase: string
  ): void {
    try {
      createSecureContext({ passphrase, pfx });
    } catch (e) {
      logger.warn(
        `Error Loading Certificate: Wrong passphrase for certificate ${name}.`
      );
    }
  }
}
