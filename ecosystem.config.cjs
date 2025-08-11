module.exports = {
  apps: [
    {
      name: 'raunaimer-backend',
      script: 'dist/src/main.js',
      cwd: './backend',
      instances: 1,
      exec_mode: 'fork', // Mudança para fork para evitar conflitos de cluster
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      kill_timeout: 5000, // Tempo para aguardar antes de forçar kill
      wait_ready: true, // Aguarda sinal de ready
      listen_timeout: 10000, // Timeout para aguardar aplicação ficar pronta
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URL: 'postgresql://raunaimer:qbO%23259Qq@localhost:5432/raunaimer',
        REDIS_URL: 'redis://localhost:6379',
        JWT_SECRET: 'seu-jwt-secret-aqui',
        BASE_URL: 'https://app.raunaimer.adv.br'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URL: 'postgresql://raunaimer:qbO%23259Qq@localhost:5432/raunaimer',
        REDIS_URL: 'redis://localhost:6379',
        JWT_SECRET: 'seu-jwt-secret-aqui',
        BASE_URL: 'https://app.raunaimer.adv.br'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'raunaimer-frontend',
      script: 'npx',
      args: 'serve -s -l 3000 -n',
      cwd: './dist',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      kill_timeout: 3000,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
}; 