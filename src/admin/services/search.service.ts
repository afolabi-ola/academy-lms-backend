// import { User } from '../../generated/prisma/browser';
import { Role, User } from '../../generated/prisma/client';
import prisma from '../../lib/prisma';
import { SearchResult } from '../controllers/searchController';

export const searchService = async (query: string, currentUser: User) => {
  // Implementation for searching all resources

  if (currentUser.role === Role.SUPER_ADMIN)
    return await searchUsers(query, currentUser);

  const [students, courses, sliders, faqs, users, enrollments, payments] =
    await Promise.all([
      searchStudents(query),
      searchCourses(query),
      searchSliders(query),
      searchFaqs(query),
      searchUsers(query, currentUser),
      searchEnrollments(query),
      searchPayments(query),
      // searchSettings(query), // Uncomment if you want to include settings in the search
    ]);

  // Combine results from different searches
  const results: SearchResult[] = [
    ...students,
    ...courses,
    ...sliders,
    ...faqs,
    ...users,
    ...enrollments,
    ...payments,
  ];

  return results;
};

export const searchStudents = async function (
  query: string,
): Promise<SearchResult[]> {
  // Implementation for searching students

  const students = await prisma.student.findMany({
    where: {
      OR: [
        { surname: { contains: query, mode: 'insensitive' } },
        { firstname: { contains: query, mode: 'insensitive' } },
        { otherName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
      ],
    },
  });

  return students.map((student) => ({
    type: 'student',
    id: student.id,
    title: `${student.firstname} ${student.surname}`,
    subtitle: student.email || '',
  }));
};

export const searchCourses = async function (
  query: string,
): Promise<SearchResult[]> {
  // Implementation for searching courses

  const courses = await prisma.course.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
  });

  return courses.map((course) => ({
    type: 'course',
    id: course.id,
    title: course.title,
    subtitle: course.description || '',
  }));
};

export const searchSliders = async function (
  query: string,
): Promise<SearchResult[]> {
  // Implementation for searching sliders

  const sliders = await prisma.slider.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
  });

  return sliders.map((slider) => ({
    type: 'slider',
    id: slider.id,
    title: slider.title,
    subtitle: slider.description || '',
  }));
};

export const searchFaqs = async function (
  query: string,
): Promise<SearchResult[]> {
  // Implementation for searching FAQs

  const faqs = await prisma.faq.findMany({
    where: {
      OR: [
        { question: { contains: query, mode: 'insensitive' } },
        { answer: { contains: query, mode: 'insensitive' } },
      ],
    },
  });

  return faqs.map((faq) => ({
    type: 'faq',
    id: faq.id,
    title: faq.question,
    subtitle: faq.answer || '',
  }));
};

export const searchUsers = async function (
  query: string,
  currentUser: User,
): Promise<SearchResult[]> {
  // Implementation for searching users

  if (currentUser.role === Role.SUB_ADMIN) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: {
      AND: [
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },

        ...(currentUser.role !== Role.SUPER_ADMIN
          ? [{ role: { not: Role.SUPER_ADMIN } }]
          : []),
      ],
    },
  });

  return users.map((user) => ({
    type: 'user',
    id: user.id,
    title: user.name,
    subtitle: user.email || '',
  }));
};

export const searchEnrollments = async function (
  query: string,
): Promise<SearchResult[]> {
  // Implementation for searching enrollments

  const enrollments = await prisma.enrollment.findMany({
    where: {
      OR: [
        { student: { firstname: { contains: query, mode: 'insensitive' } } },

        { student: { surname: { contains: query, mode: 'insensitive' } } },

        { student: { otherName: { contains: query, mode: 'insensitive' } } },

        { student: { email: { contains: query, mode: 'insensitive' } } },

        { course: { title: { contains: query, mode: 'insensitive' } } },
      ],
    },

    include: {
      student: true,
      course: true,
    },
  });

  return enrollments.map((enrollment) => ({
    type: 'enrollment',
    id: enrollment.id,
    title: `${enrollment.student.firstname} ${enrollment.student.surname}`,
    subtitle: enrollment.course.title || '',
  }));
};

export const searchPayments = async function (
  query: string,
): Promise<SearchResult[]> {
  // Implementation for searching payments

  const payments = await prisma.payment.findMany({
    where: {
      OR: [
        { reference: { contains: query, mode: 'insensitive' } },
        {
          enrollment: {
            student: { firstname: { contains: query, mode: 'insensitive' } },
          },
        },
        {
          enrollment: {
            student: { surname: { contains: query, mode: 'insensitive' } },
          },
        },
        {
          enrollment: {
            student: { otherName: { contains: query, mode: 'insensitive' } },
          },
        },
        {
          enrollment: {
            student: { email: { contains: query, mode: 'insensitive' } },
          },
        },
        {
          enrollment: {
            course: { title: { contains: query, mode: 'insensitive' } },
          },
        },
      ],
    },

    include: {
      enrollment: {
        include: {
          student: true,
        },
      },
    },
  });

  return payments.map((payment) => ({
    type: 'payment',
    id: payment.id,
    title: `${payment.enrollment.student.firstname} ${payment.enrollment.student.surname}`,
    subtitle: `${payment.amount.toLocaleString()} • ${payment.reference}`,
  }));
};

// export const searchSettings = async function (
//   query: string,
// ): Promise<SearchResult[]> {
//   // Implementation for searching settings

//   const settings = await prisma.setting.findMany({
//     where: {
//       OR: [
//         { key: { contains: query, mode: 'insensitive' } },
//         { value: { contains: query, mode: 'insensitive' } },
//       ],
//     },
//   });

//   return settings.map((setting) => ({
//     type: 'setting',
//     id: setting.id,
//     title: setting.key,
//     subtitle: setting.value || '',
//   }));
// };
