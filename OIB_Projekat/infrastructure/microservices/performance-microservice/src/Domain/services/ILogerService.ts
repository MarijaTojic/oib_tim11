export interface ILogerService {
  log(message: string, level?: 'INFO' | 'WARNING' | 'ERROR'): Promise<void>;
}
