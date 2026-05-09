export class ApiResponses<T = unknown> {
  public readonly success: boolean;
  public readonly message: string;
  public readonly data?: T | undefined;

  constructor(success: boolean, message: string, data?: T) {
    this.success = success;
    this.message = message;
    this.data = data;
  }

  // ─────────────── Static helpers ───────────────────
  static success<T>(data: T, message: string = "Success"): ApiResponses<T> {
    return new ApiResponses(true, message, data);
  }

  static error(message: string): ApiResponses<null> {
    return new ApiResponses(false, message, null);
  }
}
