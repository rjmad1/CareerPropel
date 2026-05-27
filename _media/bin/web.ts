import { spawn } from 'child_process';
import path from 'path';
import { createLogger } from '@/lib/logging/logger';
import { runtimeSettings } from '@/lib/runtime/settings';
import { registerGracefulShutdown } from '@/lib/runtime/shutdown';

const webLogger = createLogger({ runtime: 'web' });

const nextBinary =
  process.platform === 'win32'
    ? path.join(process.cwd(), 'node_modules', '.bin', 'next.cmd')
    : path.join(process.cwd(), 'node_modules', '.bin', 'next');

const child = spawn(
  nextBinary,
  ['start', '-p', String(runtimeSettings.defaultPort), '-H', runtimeSettings.defaultHostname],
  {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  }
);

child.on('exit', (code) => {
  webLogger.info({ code }, 'Web runtime exited');
  process.exit(code ?? 0);
});

registerGracefulShutdown('web', [], child);
webLogger.info(
  {
    port: runtimeSettings.defaultPort,
    hostname: runtimeSettings.defaultHostname,
  },
  'Web runtime started'
);
