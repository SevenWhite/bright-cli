import {container} from "../Config";
import {logger} from "../Utils";
import {InitPlatform, StartOptions} from "../Init";
import {Arguments, Argv, CommandModule} from "yargs";

export class Init implements CommandModule {
  public readonly command = 'init [options]';
  public readonly describe = 'Init the default profile';

  public builder(argv: Argv): Argv {
    return argv
      .option('profile', {
        alias: 'p',
        describe: 'Profile',
        default: 'default',
        requiresArg: true,
      })
  }

  public async handler(args: Arguments): Promise<void> {
    try {
      const app = container.resolve<InitPlatform>(InitPlatform);

      const stop = async () => {
        await app.stop();
        process.exit(0);
      };

      process.on('SIGTERM', stop).on('SIGINT', stop).on('SIGHUP', stop);
      await app.start({ profile: args.profile } as StartOptions);
    } catch (e) {
      logger.error(`Error during "init": ${e.error || e.message}`);
      process.exit(1);
    }
  }
}