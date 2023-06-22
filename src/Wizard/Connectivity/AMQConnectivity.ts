import { TestType } from '../TestType';
import { Connectivity } from './Connectivity';
import { logger } from '../../Utils';
import {Profiles} from "../../Init";
import { post } from 'request-promise';
import { inject, injectable } from 'tsyringe';
import { URL } from 'url';

@injectable()
export class AMQConnectivity implements Connectivity {
  public readonly type = TestType.AUTH;
  private readonly CONNECTION_TIMEOUT = 10 * 1000; // 10 seconds

  constructor(
    // @inject(Tokens) private readonly tokens: Tokens,
    @inject(Profiles) private readonly profiles: Profiles
  ) {}

  public async test(url: URL): Promise<boolean> {
    let username: string;
    let password: string;
    const credentials = this.profiles.readActiveProfile();
    if (credentials) {
      username = credentials.repeater.id
      password = credentials.apiKey;
    }

    try {
      const body = await post({
        url,
        timeout: this.CONNECTION_TIMEOUT,
        form: {
          username,
          password
        }
      });

      logger.debug('AMQ connectivity test returned: %s', body);

      return body === 'allow';
    } catch (res) {
      if (res.error) {
        logger.debug('AMQ connectivity failed: %s', res.error.message);
      } else {
        logger.debug(
          'AMQ connectivity failed with status code %d',
          res.response.statusCode
        );
      }

      return false;
    }
  }
}
