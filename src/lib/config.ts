export interface Config {
  MODE: 'browser' | 'server';
  DB_PATH: string;
}

const browserConfig = {
  MODE: 'browser' as const,
  DB_PATH: '/sqlite/database.db'
};

const serverConfig = async () => {
  // Dynamically import path module only in server environment
  const path = await import('path');
  return {
    MODE: 'server' as const,
    DB_PATH: path.join(process.cwd(), 'sqlite/database.db')
  };
};

let config: Config;

export async function loadConfig(): Promise<Config> {
  if (config) return config;

  // Default to server unless explicitly in browser
  const mode = typeof window !== 'undefined' ? 'browser' : 'server';

  console.log("MODE", mode);

  config = mode === 'browser' ? browserConfig : await serverConfig();
  return config;
}
