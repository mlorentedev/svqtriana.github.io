export function normalizePath(pathname: string): string {
  const clean = pathname.replace(/\.html$/, '').replace(/\/+$/, '');
  return clean === '' ? '/' : clean;
}

export function isNavActive(pathname: string, href: string): boolean {
  const path = normalizePath(pathname);
  if (href.startsWith('/#')) return path === '/';
  return path === href.replace(/\/+$/, '');
}
