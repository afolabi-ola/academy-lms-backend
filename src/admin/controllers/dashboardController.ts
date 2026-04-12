import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../middlewares/catchAsync';
import prisma from '../../lib/prisma';
import {
  constructDate,
  buildDateCondition,
  buildJoinDateCondition,
} from '../../utils/constructDate';

export const getDashboard = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { range, from, to } = req.query;

    const { startDate, endDate } = constructDate(
      range as 'today' | 'week' | 'month' | 'year' | 'custom',
      from as string,
      to as string,
    );

    const dateFilter =
      startDate && endDate
        ? {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }
        : {};

    const enrollmentDateCondition = buildDateCondition('e', startDate, endDate);

    // const paymentDateCondition = buildDateCondition('p', startDate, endDate); use when payment filter only is needed

    const paymentJoinCondition = buildJoinDateCondition(
      'p',
      startDate,
      endDate,
    );

    const stats = await prisma.$transaction(async (tx) => {
      const [
        totalStudents,
        activeStudents,
        totalCourses,
        activeCourses,
        totalEnrollments,
        totalPaymentsReceivedAggregate,
      ] = await Promise.all([
        tx.student.count(),
        tx.student.count({ where: { active: true } }),
        tx.course.count(),
        tx.course.count({ where: { isActive: true } }),
        tx.enrollment.count(),
        tx.payment.aggregate({
          _sum: {
            amount: true,
          },
          where: dateFilter,
        }),
      ]);

      const recentPayments = await tx.payment.findMany({
        where: dateFilter,
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          enrollment: {
            include: {
              student: true,
              course: true,
            },
          },
        },
      });

      const recentEnrollments = await tx.enrollment.findMany({
        where: dateFilter,
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          student: true,
          course: true,
        },
      });

      const totalPaymentsReceived =
        totalPaymentsReceivedAggregate._sum.amount || 0;

      const totalExpectedFeeCompute = await tx.$queryRawUnsafe<
        { total: number }[]
      >(`
      SELECT COALESCE(SUM(c.fee),0) as total
      FROM "Enrollment" e
      JOIN "Course" c ON e."courseId" = c.id
      ${enrollmentDateCondition}
      `);

      const totalExpectedFee = totalExpectedFeeCompute[0]?.total || 0;

      const totalOutstandingBalance = Number(
        (totalExpectedFee - totalPaymentsReceived).toFixed(2),
      );

      const paymentStatusSummary = await tx.$queryRawUnsafe<
        { status: 'FULL' | 'PARTIAL' | 'UNPAID'; total: number }[]
      >(`
        SELECT status, COUNT(*) as total
          FROM (
            SELECT 
              CASE
                WHEN COALESCE(SUM(p.amount), 0) = 0 THEN 'UNPAID'
                WHEN COALESCE(SUM(p.amount), 0) < c.fee THEN 'PARTIAL'
                ELSE 'FULL'
              END as status
            FROM "Enrollment" e
            JOIN "Course" c ON e."courseId" = c.id
            LEFT JOIN "Payment" p 
            ON p."enrollmentId" = e.id
            AND ${paymentJoinCondition}
            ${enrollmentDateCondition}
            GROUP BY e.id, c.fee
          ) as sub
        GROUP BY status
        `);

      const summary = {
        fullyPaid: 0,
        partiallyPaid: 0,
        unpaid: 0,
      };

      paymentStatusSummary.forEach((item) => {
        if (item.status === 'FULL') summary.fullyPaid = Number(item.total);
        if (item.status === 'PARTIAL')
          summary.partiallyPaid = Number(item.total);
        if (item.status === 'UNPAID') summary.unpaid = Number(item.total);
      });

      const totalCourseEnrollments = await tx.$queryRawUnsafe<
        {
          title: string;
          total: bigint;
          expectedRevenue: number;
          actualRevenue: number;
          outstandingBalance: number;
        }[]
      >(`
        SELECT 
            c.title,
            COUNT(e.id) as "total",
            COALESCE(SUM(c.fee), 0) as "expectedRevenue",
            COALESCE(SUM(p.totalPaid), 0) as "actualRevenue",
            COALESCE(SUM(c.fee), 0) - COALESCE(SUM(p.totalPaid), 0) as "outstandingBalance"
        FROM "Enrollment" e
        JOIN "Course" c ON e."courseId" = c.id
        
        
        LEFT JOIN (
          SELECT 
          "enrollmentId",
          COALESCE(SUM(amount), 0) as totalPaid
          FROM "Payment"
          GROUP BY "enrollmentId"
          ) p ON p."enrollmentId" = e.id
          
          
        GROUP BY c.id, c.title
      `);

      const formattedTotalCourseEnrollments = totalCourseEnrollments.map(
        (item) => ({
          title: item.title,
          totalEnrolled: Number(item.total),
          expectedRevenue: Number(item.expectedRevenue),
          actualRevenue: Number(item.actualRevenue),
          outstandingBalance: Number(item.outstandingBalance),
        }),
      );

      return {
        range: range || 'all',
        from: startDate,
        to: endDate,

        overview: {
          totalStudents,
          activeStudents,
          totalCourses,
          activeCourses,
          totalEnrollments,
          totalPaymentsReceived,
          totalOutstandingBalance,
        },
        paymentStatusSummary: {
          fullyPaid: summary.fullyPaid ?? 0,
          partiallyPaid: summary.partiallyPaid ?? 0,
          unpaid: summary.unpaid ?? 0,
        },
        recents: {
          payments: {
            results: recentPayments.length,
            data: recentPayments,
          },
          enrollments: {
            results: recentEnrollments.length,
            data: recentEnrollments,
          },
        },
        courseStats: {
          results: formattedTotalCourseEnrollments.length,
          data: formattedTotalCourseEnrollments,
        },
      };
    });

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  },
);
