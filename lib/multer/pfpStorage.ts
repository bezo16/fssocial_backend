import { diskStorage } from 'multer';
import { extname } from 'path';

const pfpStorage = diskStorage({
  destination: './public/avatars',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

export default pfpStorage;
