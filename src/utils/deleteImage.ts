import fs from 'fs';
import path from 'path';

export default function deleteFile(resource: string, filePath: string): void {
  const oldFilePath = path.join(
    process.cwd(),
    'public',
    'uploads',
    resource,
    filePath,
  ); // Construct the full path to the image

  fs.unlink(oldFilePath, (err) => {
    if (err) {
      console.error(`Error deleting file at ${oldFilePath}:`, err);
    } else {
      console.log(`Successfully deleted file at ${oldFilePath}`);
    }
  });
}
