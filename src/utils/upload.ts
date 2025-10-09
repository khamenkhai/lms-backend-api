// import multer, { FileFilterCallback } from 'multer';
// import { Request } from 'express';
// import path from 'path';

// const ALLOWED_EXTENSIONS = [
//   // Images
//   '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg',
//   // Videos
//   '.mp4', '.mpeg', '.mov', '.avi', '.wmv', '.webm',
//   // PDF
//   '.pdf'
// ];

// const fileFilter = (
//   req: Request,
//   file: Express.Multer.File,
//   cb: FileFilterCallback
// ) => {
//   console.log(`📁 [Multer] Received file: ${file.originalname}, type: ${file.mimetype}`);

//   const extension = path.extname(file.originalname).toLowerCase();
//   const isValid = ALLOWED_EXTENSIONS.includes(extension);
  
//   if (!isValid) {
//     console.error(`❌ [Multer] Invalid file extension: ${extension}`);
//     return cb(new Error('Invalid file type. Only images, videos, and PDFs are allowed.'));
//   }
  
//   console.log(`✅ [Multer] File extension valid: ${extension}`);
//   cb(null, true);
// };

// const storage = multer.diskStorage({
//   destination: function (
//     req: Request,
//     file: Express.Multer.File,
//     cb: (error: Error | null, destination: string) => void
//   ) {
//     cb(null, 'public/uploads');
//   },

//   filename: function (
//     req: Request,
//     file: Express.Multer.File,
//     cb: (error: Error | null, filename: string) => void
//   ) {
//     const fileName = path.parse(file.originalname).name.split(' ').join('-');
//     const extension = path.extname(file.originalname);
//     const finalName = `${fileName}-${Date.now()}${extension}`;
    
//     console.log(`🖊️ [Multer] Saving file as: ${finalName}`);
//     cb(null, finalName);
//   }
// });

// export const uploadOptions = multer({ 
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 50 * 1024 * 1024, // 50MB limit
//   }
// });