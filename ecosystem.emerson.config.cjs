module.exports = {
  apps: [
    {
      name: 'emerson-backend',
      script: 'dist/src/main.js',
      cwd: './backend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      env: {
        NODE_ENV: 'production',
        PORT: 3002, // Porta diferente do sistema raunaimer
        DATABASE_URL: 'postgresql://emersonadv1:qbO%23259Qq@emersonadv1.postgresql.dbaas.com.br:5432/emersonadv1',
        REDIS_URL: 'redis://localhost:6380', // Redis diferente
        JWT_SECRET: 'emerson-jwt-secret-production-2024',
        BASE_URL: 'https://emersonreis.adv.br'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
        DATABASE_URL: 'postgresql://emersonadv1:qbO%23259Qq@emersonadv1.postgresql.dbaas.com.br:5432/emersonadv1',
        REDIS_URL: 'redis://localhost:6380',
        JWT_SECRET: 'emerson-jwt-secret-production-2024',
        BASE_URL: 'https://emersonreis.adv.br'
      },
      error_file: './logs/emerson-backend-error.log',
      out_file: './logs/emerson-backend-out.log',
      log_file: './logs/emerson-backend-combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'emerson-frontend',
      script: 'npx',
      args: 'serve -s -l 3003 -n', // Porta diferente do sistema raunaimer
      cwd: './dist',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      kill_timeout: 3000,
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      error_file: './logs/emerson-frontend-error.log',
      out_file: './logs/emerson-frontend-out.log',
      log_file: './logs/emerson-frontend-combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
