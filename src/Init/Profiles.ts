import { Credentials } from './Credentials';

export interface Profiles {
  activateProfile(profile: string): void;
  readActiveProfile(): Credentials | undefined;
  saveProfile(profile: string, credentials: Credentials): void;
  removeProfile(profile: string): void;
  readProfile(profile: string): Credentials | undefined;
}

export const Profiles: unique symbol = Symbol('Profiles');
