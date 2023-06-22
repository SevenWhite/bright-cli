import { Credentials } from './Credentials';
import { logger } from '../Utils';
import {Profiles} from "./Profiles";
import {ProfilesFile} from "./ProfilesFile";
import { injectable } from 'tsyringe';
import { homedir } from 'os';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

@injectable()
export class FSProfiles implements Profiles {
  private readonly baseDir: string = homedir();

  public activateProfile(profile: string) {
    const profilesFile = this.readProfilesFile();
    profilesFile.activeProfile = profile;

    this.writeToFile(profilesFile);
  }

  public saveProfile(profile: string, credentials: Credentials): void {
    logger.debug(
      'Saving profile to file %s for profile %s',
      this.path,
      profile
    );

    const profilesFile = this.readProfilesFile();
    profilesFile.activeProfile = profile;
    profilesFile.profiles[profile] = credentials;

    this.writeToFile(profilesFile);
  }

  public removeProfile(profile: string) {
    // eslint-disable-next-line no-console
    console.log('remove profile', profile);
  }

  public readActiveProfile(): Credentials | undefined {
    const profilesFile = this.readProfilesFile();

    return profilesFile.profiles[profilesFile.activeProfile];
  }

  public readProfile(profile: string): Credentials | undefined {
    const profilesFile = this.readProfilesFile();

    return profilesFile.profiles[profile];
  }

  private writeToFile(fileData: ProfilesFile) {
    writeFileSync(this.path, JSON.stringify(fileData));
  }

  private readProfilesFile(): ProfilesFile {
    logger.debug('Reading saved profiles from file %s', this.path);
    if (existsSync(this.path)) {
      logger.debug('Profiles File found.');
      const resultRaw: Buffer = readFileSync(this.path);

      const profiles = JSON.parse(resultRaw.toString('utf8')) as ProfilesFile;
      if (!profiles) {
        return;
      }

      return profiles;
    } else {
      // TODO: should we create a file here ?
      logger.debug("File doesn't exist. Will create an empty file");
      writeFileSync(this.path, JSON.stringify({}));
      const profilesFile: ProfilesFile = {
        activeProfile: 'default',
        profiles: {}
      };
      this.writeToFile(profilesFile);

      return profilesFile;
    }
  }

  private get path(): string {
    return join(this.baseDir, '.bright-cli.profiles');
  }
}
