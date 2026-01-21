import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig(({ command }) => {
  // Development mode - serve demo app
  if (command === 'serve') {
    return {
      plugins: [react()],
      root: 'demo',
      resolve: {
        alias: {
          '@': resolve(__dirname, 'src'),
        },
      },
    };
  }

  // Build mode - build library
  return {
    plugins: [
      react(),
      dts({
        include: ['src/**/*.ts', 'src/**/*.tsx'],
        exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'demo/**'],
        rollupTypes: true,
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'HaroReactGantt',
        formats: ['es', 'cjs'],
        fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'jsxRuntime',
          },
          assetFileNames: 'styles[extname]',
        },
      },
      cssCodeSplit: false,
      sourcemap: true,
    },
  };
});
