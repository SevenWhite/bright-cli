export interface StartOptions {
  profile: string;
}

export interface InitPlatform {
  start(options?: StartOptions): Promise<void>;

  stop(): Promise<void>;
}

export const InitPlatform: unique symbol = Symbol('InitPlatform');
