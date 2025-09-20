// utils/certificateQueue.ts
import { prismaClient } from "./prismaClient";
import ejs from "ejs";
import puppeteer from "puppeteer";
import cloudinary from "./cloudinary";
import path from "path";
import stream from "stream";

interface CertificateJob {
  userId: number;
  courseId: number;
  userName: string;
  courseTitle: string;
}

const jobQueue: CertificateJob[] = [];
let isProcessing = false;

export const addJob = (job: CertificateJob) => {
  jobQueue.push(job);
  processQueue();
};

const processQueue = async () => {
  if (isProcessing) return; // Already processing
  isProcessing = true;

  while (jobQueue.length > 0) {
    const job = jobQueue.shift()!;
    try {
      await generateCertificate(job);
    } catch (err) {
      console.error("Certificate generation failed:", err);
    }
  }

  isProcessing = false;
};

const generateCertificate = async (job: CertificateJob) => {
  // Render EJS template
  const html = await ejs.renderFile(
    path.join(__dirname, "../ejs/certificate.ejs"),
    {
      user: { name: job.userName },
      course: { title: job.courseTitle },
      instructor: { name: "John Doe" },
      issued_at: new Date(),
      certificate_id: `${job.userId}_${job.courseId}`,
      logoUrl: "public/assets/award.png",
    }
  );

  // Launch Puppeteer
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();

  // Upload PDF to Cloudinary
  const certificateUrl: string = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "certificates",
        public_id: `certificate_${job.userId}_${job.courseId}`,
        resource_type: "raw", // PDF
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result!.secure_url);
      }
    );
    const bufferStream = new stream.PassThrough();
    bufferStream.end(pdfBuffer);
    bufferStream.pipe(uploadStream);
  });

  // Update certificate record
  await prismaClient.certificate.update({
    where: {
      user_id_course_id: { user_id: job.userId, course_id: job.courseId },
    },
    data: { certificate_url: certificateUrl, issued_at: new Date() },
  });

  console.log(
    `Certificate generated for user ${job.userId}, course ${job.courseId}`
  );
};
