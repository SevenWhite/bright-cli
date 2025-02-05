import { bind, Handler } from '../Bus';
import { Request, RequestExecutor, Response } from '../RequestExecutor';
import { ExecuteScript, ForwardResponse } from './Events';
import { injectable, injectAll } from 'tsyringe';

@injectable()
@bind(ExecuteScript)
export class SendRequestHandler
  implements Handler<ExecuteScript, ForwardResponse>
{
  constructor(
    @injectAll(RequestExecutor)
    private readonly requestExecutors: RequestExecutor[]
  ) {}

  public async handle(event: ExecuteScript): Promise<ForwardResponse> {
    const { protocol } = event;

    const requestExecutor = this.requestExecutors.find(
      (x) => x.protocol === protocol
    );

    if (!requestExecutor) {
      throw new Error(`Unsupported protocol "${protocol}"`);
    }

    const response: Response = await requestExecutor.execute(
      new Request({ ...event, correlationIdRegex: event.correlation_id_regex })
    );

    const { statusCode, message, errorCode, body, headers } = response;

    return new ForwardResponse(
      protocol,
      body,
      headers,
      statusCode,
      errorCode,
      message
    );
  }
}
