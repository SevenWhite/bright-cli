import { Event } from '../../Bus/Event';
import { Protocol } from '../../RequestExecutor';

export class ForwardResponse implements Event {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  public readonly status_code?: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  public readonly error_code?: string;
  public readonly message?: string;
  public readonly protocol?: Protocol;
  public readonly headers?: Record<string, string | string[]>;
  public readonly body?: string;

  constructor(
    protocol: Protocol,
    body: string,
    headers: Record<string, string | string[]>,
    statusCode?: number,
    errorCode?: string,
    message?: string
  ) {
    this.protocol = protocol;
    this.body = body;
    this.headers = headers;
    this.status_code = statusCode;
    this.error_code = errorCode;
    this.message = message;
  }
}
