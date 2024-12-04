export interface Config {
  MODE: 'browser' | 'server';
  DB_PATH: string;
}

const browserConfig = {
  MODE: 'browser' as const,
  DB_PATH: 'sqlite/database.db'
};

let config: Config;

export async function loadConfig(): Promise<Config> {
  if (config) return config;

  const mode = globalThis.window ? 'browser' : 'server';

  if (mode === 'browser') {
    config = browserConfig;
  } else {
    // Dynamically import path module only in server environment
    const path = await import('path');
    config = {
      MODE: 'server',
      DB_PATH: path.default.join(process.cwd(), 'sqlite', 'database.db')
    };
  }

  return config;
}
