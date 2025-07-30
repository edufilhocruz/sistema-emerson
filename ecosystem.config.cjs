module.exports = {
  apps: [
    {
      name: 'raunaimer-backend',
      script: 'dist/src/main.js',
      cwd: './backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URL: 'postgresql://raunaimer:qbO%23259Qq@localhost:5432/raunaimer',
        REDIS_URL: 'redis://localhost:6379',
        JWT_SECRET: 'seu-jwt-secret-aqui',
        JWT_EXPIRES_IN: '24h'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URL: 'postgresql://raunaimer:qbO%23259Qq@localhost:5432/raunaimer'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'raunaimer-frontend',
      script: 'node_modules/.bin/serve',
      cwd: './dist',
      args: '-s -l 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
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
      time: true
    }
  ]
}; 