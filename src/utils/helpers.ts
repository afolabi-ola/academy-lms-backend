import cloudinary, { CLOUDINARY_ROOT_FOLDER } from './cloudinary';

export function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  publicId: string,
): Promise<{ secure_url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    console.log('☁️ Cloudinary upload started');
    console.log({
      folder,
      publicId,
      bufferSize: buffer.length,
    });

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${CLOUDINARY_ROOT_FOLDER}/${folder}`,
        resource_type: 'image',
        public_id: publicId,
        overwrite: true,
        invalidate: true,
        timeout: 120000,
      },
      (error, result) => {
        console.log(
          `☁️ Cloudinary responded after ${Date.now() - startedAt}ms`,
        );

        if (error) {
          console.error('☁️ Cloudinary error:', error);
          return reject(
            new Error(`Error uploading to cloudinary: ${error.message}`),
          );
        }

        if (!result) {
          return reject(new Error('No result returned from Cloudinary upload'));
        }

        console.log('☁️ Cloudinary upload successful');

        resolve({
          secure_url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    stream.end(buffer);
  });
}

export function deleteFromCloudinary(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      { resource_type: 'image', invalidate: true },
      (error, result) => {
        if (error) {
          console.error('☁️ Cloudinary deletion error:', error);
          return reject(
            new Error(`Error deleting from cloudinary: ${error.message}`),
          );
        }

        if (result.result !== 'ok') {
          return reject(
            new Error(
              `Failed to delete image from Cloudinary: ${result.result}`,
            ),
          );
        }

        console.log('☁️ Cloudinary deletion successful', result);
        resolve();
      },
    );
  });
}
