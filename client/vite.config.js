import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

const httpToHttpsRedirectPlugin = () => ({
  name: 'http-to-https-redirect',
  configureServer(server) {
    server.httpServer?.on('clientError', (err, socket) => {
      if (err.code === 'ERR_SSL_HTTP_REQUEST' || (err.message && err.message.toLowerCase().includes('http request'))) {
        const rawAddr = socket.localAddress || '';
        const ip = rawAddr.replace(/^.*:/, '') || '10.2.2.152';
        const host = ip === '127.0.0.1' ? 'localhost' : ip;
        const port = socket.localPort || 5173;
        const targetUrl = `https://${host}:${port}/`;
        const res =
          'HTTP/1.1 302 Found\r\n' +
          `Location: ${targetUrl}\r\n` +
          'Connection: close\r\n' +
          'Content-Type: text/html\r\n' +
          `Content-Length: ${targetUrl.length + 40}\r\n\r\n` +
          `Redirecting to <a href="${targetUrl}">${targetUrl}</a>`;
        socket.end(res);
      }
    });
  }
});

export default defineConfig({
  plugins: [react(), basicSsl(), httpToHttpsRedirectPlugin()],
  server: {
    host: true,
    port: 5173,
    https: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  preview: {
    host: true,
    port: 5173,
    https: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
