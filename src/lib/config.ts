import 'server-only';
import { env, type Env } from '@/config/env';

export const config = env;
export type Config = Env;

