import { type Result, type ResultAsync, err, errAsync } from 'neverthrow';

export class ResultAwareError extends Error {
  /**
   * @internal
   */
  asResultAsync(): ResultAsync<never, typeof this> {
    return errAsync(this);
  }

  /**
   * @internal
   */
  asResult(): Result<never, typeof this> {
    return err(this);
  }

  /**
   * @internal
   */
  static from<T extends typeof ResultAwareError>(this: T, message: string): InstanceType<T>;
  static from<T extends typeof ResultAwareError>(this: T, cause: unknown): InstanceType<T>;
  static from<T extends typeof ResultAwareError>(this: T, args: unknown): InstanceType<T> {
    if (args instanceof Error) {
      const message = ResultAwareError.formatMessage(args);
      // biome-ignore lint/complexity/noThisInStatic: <explanation>
      return new this(message, { cause: args }) as InstanceType<T>;
    }
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    return new this(String(args)) as InstanceType<T>;
  }

  private static formatMessage(cause: Error): string {
    const messages: string[] = [];
    let currentError: unknown = cause;

    while (currentError instanceof Error) {
      messages.push(currentError.message);
      currentError = currentError.cause;
    }

    return messages.join(' due to ');
  }
}
