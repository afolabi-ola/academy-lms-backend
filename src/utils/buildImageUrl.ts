import { Request } from 'express';

export default function buildImageUrl(
  req: Request,
  resource: string,
  filename: string,
): string | null {
  if (!filename || !resource) return null;

  return `${req.protocol}://${req.get('host')}/uploads/${resource}/${filename}`;
}
