import { RequestHandler } from 'express';

// Express 5 (path-to-regexp v8) no longer exposes mount-path params such as
// '/project/:projectId/pages' to the mounted router's req.params. This helper
// captures them from the URL and exposes them as req.<name>.
export function captureMountParams(mountPath: string): RequestHandler {
  const parts = mountPath.split('/').filter(Boolean);
  const names = parts.filter((p) => p.startsWith(':')).map((p) => p.slice(1));
  if (!names.length) return (_req, _res, next) => next();

  const pattern = new RegExp(
    '^/' + parts.map((p) => (p.startsWith(':') ? '([^/]+)' : p)).join('/'),
  );

  return (req: any, _res, next) => {
    const path = req.originalUrl.split('?')[0];
    const m = pattern.exec(path);
    if (m) names.forEach((n, i) => { req[n] = m[i + 1]; });
    next();
  };
}
