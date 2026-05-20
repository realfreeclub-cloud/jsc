module.exports = {
  apps: [
    {
      name: 'judicial-server',
      script: 'dist/index.js',
      cwd: './server',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'judicial-client',
      script: 'node_modules/vite/bin/vite.js',
      args: 'preview --port 3000 --host',
      cwd: './client',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'judicial-admin',
      script: 'node_modules/vite/bin/vite.js',
      args: 'preview --port 3001 --host',
      cwd: './admin',
      env: {
        NODE_ENV: 'production',
      },
    }
  ]
};
