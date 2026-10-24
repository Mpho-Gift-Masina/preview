import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (command === 'build' && !env.VITE_WEB3FORMS_KEY) {
    throw new Error(
      'VITE_WEB3FORMS_KEY is not set. Orders could not be emailed. ' +
        'Add it to .env or your host\'s environment variables (see README).',
    );
  }

  return {
    plugins: [react()],
  };
});
