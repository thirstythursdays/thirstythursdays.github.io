import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base: './'` emits relative asset URLs, so the build works under any path
// prefix (github.io root, github.io/<repo>/, or <anotherdomain>.com/<username>/).
export default defineConfig({
  base: './',
  plugins: [react()],
});
