// Static export for GitHub Pages, served under /globber.
const basePath = process.env.NODE_ENV === 'production' ? '/globber' : '';

/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};
