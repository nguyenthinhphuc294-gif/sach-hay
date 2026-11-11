import { copyFile } from 'node:fs/promises';

// The PHP view uses the compiled storefront and Apache routes storefront URLs to index.php.
await copyFile(new URL('../dist/index.html', import.meta.url), new URL('../dist/storefront.html', import.meta.url));
