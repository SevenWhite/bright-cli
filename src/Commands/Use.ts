import {Profiles} from "../Init";
import {logger} from "../Utils";
import {Arguments, Argv, CommandModule} from "yargs";
import {container} from "tsyringe";

export class Use implements CommandModule {
  public readonly command = 'use <profile>';
  public readonly describe = 'Switch active profile';

  public builder(argv: Argv): Argv {
    return argv.positional('profile', {
      describe: 'Name of profile',
      requiresArg: true,
      demandOption: true,
      type: 'string'
    });
  }

  public async handler(args: Arguments): Promise<void> {
    try {
      const profilesManager: Profiles = container.resolve(Profiles);

      await profilesManager.activateProfile(args.profile as string);

      process.exit(0);
    } catch (e) {
      logger.error(`Error during "scan:stop": ${e.error || e.message}`);
      process.exit(1);
    }
  }
}