import prisma from '../../lib/prisma';
import AppError from '../../utils/appError';
import puppeteer from 'puppeteer';

export const getPaymentReceiptData = async (paymentId: string) => {
  // Implementation to fetch payment and create receipt data
  // This function can be used in the controller to get the receipt data

  const payment = await prisma.payment.findUnique({
    where: {
      id: Number(paymentId),
    },
    include: {
      enrollment: {
        include: {
          student: true,
          course: true,
        },
      },
    },
  });

  if (!payment) throw new AppError('Payment not found', 404);

  const { studentId, courseId } = payment.enrollment;

  const totalPaidAgg = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      enrollment: {
        studentId,
        courseId,
      },
    },
  });

  const totalPaid = totalPaidAgg._sum.amount || 0;

  const courseFee = payment.enrollment.course.fee;
  // const balance = parseFloat((courseFee - totalPaid).toFixed(2));
  const balance = courseFee - totalPaid;

  const receipt = {
    receiptId: `RCPT-${payment.id.toString().padStart(6, '0')}`,
    paymentReferenceId: payment.reference,
    student: `${payment.enrollment.student.surname} ${payment.enrollment.student.firstname} ${payment.enrollment.student.otherName}`,
    course: payment.enrollment.course.title,
    courseFee,
    amount: payment.amount,
    totalPaid,
    balance: Number(balance.toFixed(2)),
    date: payment.createdAt,
  };
  return receipt;
};

export const buildReceiptHTML = (
  receiptData: Awaited<ReturnType<typeof getPaymentReceiptData>>,
  logoUrl: string,
) => {
  // Implementation to build HTML for the receipt using the receiptData

  const {
    receiptId,
    date,
    student,
    course,
    amount,
    totalPaid,
    balance,
    paymentReferenceId,
    courseFee,
  } = receiptData;

  const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Payment Receipt</title>
          <style>
            body {
              font-family: monospace;
              width: 80mm;
              margin: 0;
              padding: 10px;
            }

            .receipt-container {
              width: 100%;
            }

            h2 {
              text-align: center;
              margin-bottom: 10px;
            }

            .line {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              margin: 5px 0;
            }

            .divider {
              border-top: 1px dashed #000;
              margin: 10px 0;
            }

            .center {
              text-align: center;
              font-size: 12px;
            }

            .logo {
              margin-bottom: 10px;
            }

             .watermark {
                position: fixed;
         
                transform: translate(0%, 90%) rotate(-55deg);
                opacity: 0.1;
                z-index: 0;
              }

              .watermark img {
                width: 400px;
              }

              .receipt-container {
                position: relative;
                z-index: 1;
              }
          </style>
        </head>
        <body>
        <div class="watermark">
          <img src="${logoUrl}" />
        </div>
        <div class="receipt-container">
            <div class="center logo">
              <img src="${logoUrl}" width="80" />
            </div>

            <div class="center">Payment Receipt</div>
            <div class="divider"></div>

            <div class="line"><strong>ID:</strong><span>${receiptId}</span></div>
            <div class="line"><strong>Transaction ID:</strong><span>${paymentReferenceId}</span></div>
            <div class="line"><strong>Date:</strong><span>${date}</span></div>

            <div class="divider"></div>

            <div class="line"><strong>Student:</strong><span>${student}</span></div>
            <div class="line"><strong>Course:</strong><span>${course}</span></div>
            <div class="line"><strong>Course Fee:</strong><span>₦${courseFee}</span></div>

            <div class="divider"></div>

            <div class="line"><strong>Paid:</strong><span>₦${amount}</span></div>
            <div class="line"><strong>Total:</strong><span>₦${totalPaid}</span></div>
            <div class="line"><strong>Balance:</strong><span>₦${balance}</span></div>

            <div class="divider"></div>

            <div class="center">Thank you</div>
          </div>
        </body>
        </html>`;

  return html;
};

export const generatePDF = async (html: string) => {
  // Implementation to generate PDF from the HTML

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: 'domcontentloaded',
  });

  const pdfBuffer = await page.pdf({
    width: '80mm',
    height: '100mm',
    printBackground: true,
  });

  await browser.close();

  return pdfBuffer;
};
