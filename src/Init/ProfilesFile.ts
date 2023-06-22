import {Credentials} from "./Credentials";

export interface ProfilesFile {
  activeProfile: string
  profiles: Record<string, Credentials>
}