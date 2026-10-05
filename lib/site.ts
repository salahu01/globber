export const asset = (p: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/assets/${p}`;

export const VERSION = 'v1.0.5';
export const REPO = 'https://github.com/salahu01/globber-app';
export const RELEASES = `${REPO}/releases/latest`;
export const blob = (f: string) => `${REPO}/blob/master/${f}`;
