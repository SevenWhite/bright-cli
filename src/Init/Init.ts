import {InitPlatform, StartOptions} from "./InitPlatform";
import {Profiles} from "./Profiles";
import {inject, injectable} from 'tsyringe';
import request, {RequestPromiseAPI} from "request-promise";
import readline from "readline";
import {EOL} from "os";


@injectable()
export class Init implements InitPlatform {
  private rl: readline.Interface;
  private readonly delimiter = `${EOL}\r--${EOL}`;
  private client: RequestPromiseAPI;
  
  constructor(
    @inject(Profiles) private readonly profiles: Profiles,
  ) {}

  public async start(options?: StartOptions): Promise<void> {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    await this.init(options);

    // eslint-disable-next-line no-console
    console.log(this.delimiter);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async stop(): Promise<void> {
    this.rl.close();
  }

  private async init(options?: StartOptions): Promise<void> {
    /* eslint-disable no-console */
    console.log(`Welcome to the Bright init wizard!${EOL}`);

    process.stdout.write(EOL);

    await this.requestTokens(options.profile);

    // eslint-disable-next-line no-console
    console.log(this.delimiter);
  }

  private createClient(baseUrl: string, timeout: number, apiKey: string) {
    const insecure = false;

    baseUrl = `https://${baseUrl}`;
    console.log('creating a client', baseUrl, apiKey);

    this.client = request.defaults({
      baseUrl,
      timeout,
      json: true,
      rejectUnauthorized: !insecure,
      // agent: proxyUrl ? new SocksProxyAgent(proxyUrl) : undefined,
      headers: { authorization: `Api-Key ${apiKey}` }
    });
  }

  private async requestTokens(profile: string): Promise<void> {
    const cluster = 'dev-hackathon.playground.brightsec.com'
    // const cluster = 'app.brightsec.com'
    let apiKey = await this.question(
      `Please enter your user API key`
    );

    apiKey = apiKey.trim();

    // if (!apiKey || !AUTH_TOKEN_VALIDATION_REGEXP.test(apiKey)) {
    if (!apiKey) {
      // eslint-disable-next-line no-console
      console.error('Invalid value for authentication token');

      return;
    }

    if (!cluster) {
      console.error('Invalid value for cluster');

      return
    }

    const timeout = 5000;
    this.createClient(cluster, timeout, apiKey);
    // const repeaterApiKey = await this.createApiKeyForRepeater();
    // console.log('repeaterApiKey', repeaterApiKey);

    const repeater = await this.createNewRepeater();

    console.log('repeater was created with id', repeater.id);

    process.stdout.write(EOL);

    await this.profiles.saveProfile(profile, { repeater, apiKey, cluster });
  }

  private async createNewRepeater(): Promise<RepeaterData> {
    const createRepeaterConfig = this.prepareCreateRepeaterConfig();

    return this.client.post({
      body: createRepeaterConfig,
      uri: `/api/v1/repeaters`
    })
  }

  private async createApiKeyForRepeater(): Promise<string> {
    const apiKeyConfig = this.prepareApiKeyConfig();

    // eslint-disable-next-line no-console

    await this.client.get({
      uri: `/api/v1/me`
    });

    return ""

    console.log('create api key')

    const { id, pureKey }: { id: string, pureKey: string } = await this.client.post({
      body: apiKeyConfig,
      uri: `/api/v1/api-keys`
    });

    // eslint-disable-next-line no-console
    console.log('api key was created with id', id)

    return pureKey
  }

  private prepareCreateRepeaterConfig() {
    const timeStamp = new Date().toUTCString()

    return {
      "name": `Demo repeater ${timeStamp}`,
      "description": "Demo repeater created with bright-cli",
      "active": true,
      "editable": false,
      "expiresIn": 86400
    }
  }

  private prepareApiKeyConfig() {
    return {
      "name": "Demo API key",
      "scopes": [
        "bot"
      ],
      "editable": false,
      "expiresIn": 86400
    }
  }

  private async question(question: string): Promise<string> {
    return new Promise((resolve) => this.rl.question(`${question}: `, resolve));
  }
}