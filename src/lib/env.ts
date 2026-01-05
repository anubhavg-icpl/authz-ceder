// Environment configuration with type safety
// All environment variables should be defined here

interface EnvConfig {
    // Cedar Agent URL (server-side only)
    CEDAR_AGENT_URL: string;

    // Node environment
    NODE_ENV: 'development' | 'production' | 'test';
}

function getEnvConfig(): EnvConfig {
    return {
        CEDAR_AGENT_URL: process.env.CEDAR_AGENT_URL || 'http://localhost:8180',
        NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
    };
}

// Singleton config instance
export const env = getEnvConfig();

// Validate required environment variables at startup
export function validateEnv(): void {
    const required: (keyof EnvConfig)[] = ['CEDAR_AGENT_URL'];

    const missing = required.filter(key => !env[key]);

    if (missing.length > 0) {
        console.warn(`Missing environment variables: ${missing.join(', ')}`);
        console.warn('Using default values. Set these in .env.local for production.');
    }
}
