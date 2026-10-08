import 'dotenv/config';

import {
  PrismaClient,
  Role,
  Currency,
  ThemeMode,
} from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

if (!process.env.DATABASE_URL)
  throw new Error('DATABASE_URL is not defined in environment variables');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const DEFAULT_SETTINGS_ID = 1;

const CLOUDINARY_ROOT_FOLDER =
  process.env.CLOUDINARY_ROOT_FOLDER || 'academy_lms';

const CLOUDINARY_BASE = 'https://res.cloudinary.com/gneyjc4o/image/upload';

const canonical = (version: string, path: string) =>
  `${CLOUDINARY_BASE}/${version}/${path}`;

/*
|--------------------------------------------------------------------------
| Permanent accounts
|--------------------------------------------------------------------------
|
| These are NOT demo accounts.
|
| Their passwords are never changed by the seed after the account exists.
| The accounts therefore survive every nightly reset.
|
*/

const PERMANENT_ACCOUNTS = {
  admin: {
    name: process.env.SEED_ADMIN_NAME || 'Academy LMS Administrator',
    email: process.env.SEED_ADMIN_EMAIL,
    password: process.env.SEED_ADMIN_PASSWORD,
    role: Role.ADMIN,
  },

  superAdmin: {
    name:
      process.env.SEED_SUPER_ADMIN_NAME || 'Academy LMS Super Administrator',
    email: process.env.SEED_SUPER_ADMIN_EMAIL,
    password: process.env.SEED_SUPER_ADMIN_PASSWORD,
    role: Role.SUPER_ADMIN,
  },
};

/*
|--------------------------------------------------------------------------
| Demo accounts
|--------------------------------------------------------------------------
|
| These credentials can be shown publicly to portfolio visitors.
|
*/

const DEMO_ACCOUNTS = {
  admin: {
    name: 'Demo Administrator',
    email: process.env.DEMO_ADMIN_EMAIL || 'demo.admin@academylms.demo',
    password: process.env.DEMO_ADMIN_PASSWORD || 'AcademyDemo@123',
    role: Role.ADMIN,
  },

  subAdmin: {
    name: 'Demo Staff Member',
    email: process.env.DEMO_SUB_ADMIN_EMAIL || 'demo.staff@academylms.demo',
    password: process.env.DEMO_SUB_ADMIN_PASSWORD || 'AcademyDemo@123',
    role: Role.SUB_ADMIN,
  },
};

/*
|--------------------------------------------------------------------------
| Canonical Cloudinary assets
|--------------------------------------------------------------------------
*/

const ASSETS = {
  settings: {
    logo: {
      url: canonical(
        'v1790163895',
        `${CLOUDINARY_ROOT_FOLDER}/settings/logo-1.jpg`,
      ),
      publicId: `${CLOUDINARY_ROOT_FOLDER}/settings/logo-1`,
    },

    favicon: {
      url: canonical(
        'v1790163896',
        `${CLOUDINARY_ROOT_FOLDER}/settings/favicon-1.jpg`,
      ),
      publicId: `${CLOUDINARY_ROOT_FOLDER}/settings/favicon-1`,
    },

    defaultStudentPhoto: {
      url: canonical(
        'v1790524592',
        `${CLOUDINARY_ROOT_FOLDER}/settings/default-student-photo-1.jpg`,
      ),
      publicId: `${CLOUDINARY_ROOT_FOLDER}/settings/default-student-photo-1`,
    },
  },

  sliders: [
    {
      url: canonical('v1790525143', `${CLOUDINARY_ROOT_FOLDER}/sliders/8.jpg`),
      publicId: `${CLOUDINARY_ROOT_FOLDER}/sliders/8`,
    },
    {
      url: canonical('v1790525158', `${CLOUDINARY_ROOT_FOLDER}/sliders/9.jpg`),
      publicId: `${CLOUDINARY_ROOT_FOLDER}/sliders/9`,
    },
    {
      url: canonical('v1790525173', `${CLOUDINARY_ROOT_FOLDER}/sliders/10.jpg`),
      publicId: `${CLOUDINARY_ROOT_FOLDER}/sliders/10`,
    },
    {
      url: canonical('v1790525187', `${CLOUDINARY_ROOT_FOLDER}/sliders/11.jpg`),
      publicId: `${CLOUDINARY_ROOT_FOLDER}/sliders/11`,
    },
  ],

  courses: [
    {
      url: canonical('v1790526765', `${CLOUDINARY_ROOT_FOLDER}/courses/18.jpg`),
      publicId: `${CLOUDINARY_ROOT_FOLDER}/courses/18`,
    },
    {
      url: canonical('v1790526796', `${CLOUDINARY_ROOT_FOLDER}/courses/19.jpg`),
      publicId: `${CLOUDINARY_ROOT_FOLDER}/courses/19`,
    },
    {
      url: canonical('v1790526815', `${CLOUDINARY_ROOT_FOLDER}/courses/22.jpg`),
      publicId: `${CLOUDINARY_ROOT_FOLDER}/courses/22`,
    },
    {
      url: canonical('v1790526828', `${CLOUDINARY_ROOT_FOLDER}/courses/20.jpg`),
      publicId: `${CLOUDINARY_ROOT_FOLDER}/courses/20`,
    },
    {
      url: canonical('v1790526845', `${CLOUDINARY_ROOT_FOLDER}/courses/21.jpg`),
      publicId: `${CLOUDINARY_ROOT_FOLDER}/courses/21`,
    },
    {
      url: canonical('v1790526860', `${CLOUDINARY_ROOT_FOLDER}/courses/23.jpg`),
      publicId: `${CLOUDINARY_ROOT_FOLDER}/courses/23`,
    },
    {
      url: canonical('v1790526880', `${CLOUDINARY_ROOT_FOLDER}/courses/24.jpg`),
      publicId: `${CLOUDINARY_ROOT_FOLDER}/courses/24`,
    },
    {
      url: canonical('v1790526899', `${CLOUDINARY_ROOT_FOLDER}/courses/25.jpg`),
      publicId: `${CLOUDINARY_ROOT_FOLDER}/courses/25`,
    },
    {
      url: canonical('v1790526929', `${CLOUDINARY_ROOT_FOLDER}/courses/26.jpg`),
      publicId: `${CLOUDINARY_ROOT_FOLDER}/courses/26`,
    },
    {
      url: canonical('v1790526950', `${CLOUDINARY_ROOT_FOLDER}/courses/17.jpg`),
      publicId: `${CLOUDINARY_ROOT_FOLDER}/courses/17`,
    },
  ],
};

/*
|--------------------------------------------------------------------------
| Course definitions
|--------------------------------------------------------------------------
*/

const COURSE_DEFINITIONS = [
  {
    title: 'Backend Development',
    description:
      'Learn how to build secure, scalable backend applications using Node.js, Express, databases and modern API architecture.',
    duration: '16 weeks',
    fee: 180000,
  },
  {
    title: 'Full Stack Development',
    description:
      'Build complete web applications from frontend interfaces to backend APIs, databases and deployment.',
    duration: '24 weeks',
    fee: 280000,
  },
  {
    title: 'Python Programming',
    description:
      'Learn Python fundamentals, object-oriented programming, automation and practical application development.',
    duration: '12 weeks',
    fee: 150000,
  },
  {
    title: 'React Development',
    description:
      'Build modern interactive web applications with React, component architecture, state management and APIs.',
    duration: '12 weeks',
    fee: 160000,
  },
  {
    title: 'Node.js Development',
    description:
      'Master server-side JavaScript with Node.js, Express, REST APIs, authentication and database integration.',
    duration: '12 weeks',
    fee: 170000,
  },
  {
    title: 'UI/UX Design',
    description:
      'Learn user research, wireframing, prototyping and interface design for modern digital products.',
    duration: '10 weeks',
    fee: 130000,
  },
  {
    title: 'Mobile App Development',
    description:
      'Learn the fundamentals of building modern mobile applications and turning product ideas into usable apps.',
    duration: '16 weeks',
    fee: 200000,
  },
  {
    title: 'Data Analysis',
    description:
      'Learn data cleaning, analysis, visualization and reporting using practical datasets and modern tools.',
    duration: '14 weeks',
    fee: 175000,
  },
  {
    title: 'Product Design',
    description:
      'Develop the skills required to turn product requirements into intuitive, usable and visually consistent experiences.',
    duration: '12 weeks',
    fee: 145000,
  },
  {
    title: 'Frontend Development',
    description:
      'Learn HTML, CSS, JavaScript and modern frontend development practices for building production-ready interfaces.',
    duration: '14 weeks',
    fee: 150000,
  },
];

/*
|--------------------------------------------------------------------------
| Nigerian student data
|--------------------------------------------------------------------------
*/

const FIRST_NAMES = [
  'Adebayo',
  'Chinedu',
  'Fatima',
  'Daniel',
  'Grace',
  'Samuel',
  'Aisha',
  'Emeka',
  'Blessing',
  'David',
  'Mariam',
  'Tunde',
  'Esther',
  'Ibrahim',
  'Precious',
  'Joshua',
  'Zainab',
  'Michael',
  'Adaeze',
  'Peter',
];

const SURNAMES = [
  'Adeyemi',
  'Okafor',
  'Abdullahi',
  'Balogun',
  'Eze',
  'Ogunleye',
  'Mohammed',
  'Akinyemi',
  'Nwosu',
  'Yusuf',
  'Olatunji',
  'Ibrahim',
  'Onwukwe',
  'Adeleke',
  'Okoro',
  'Bello',
  'Adebisi',
  'Chukwu',
  'Lawal',
  'Ojo',
  'Umeh',
  'Garba',
  'Ajayi',
  'Obi',
  'Usman',
  'Fashola',
  'Ifeanyi',
  'Suleiman',
  'Taiwo',
  'Bakare',
  'Ezeh',
  'Musa',
  'Afolayan',
  'Ogunbiyi',
  'Nwachukwu',
  'Salami',
  'Oyekan',
  'Abubakar',
  'Oladipo',
  'Oke',
];

const OTHER_NAMES = [
  'Oluwaseun',
  'Chiamaka',
  'Ifeoma',
  'Ayomide',
  'Olamide',
  'Nnamdi',
  'Kehinde',
  'Yetunde',
  'Favour',
  'Oghenekaro',
  'Tolulope',
  'Ifeanyi',
  'Damilola',
  'Somtochukwu',
  'Olumide',
];

const PARENT_NAMES = [
  'Mr. Adewale Johnson',
  'Mrs. Ngozi Okafor',
  'Mr. Ibrahim Bello',
  'Mrs. Funmi Adeyemi',
  'Mr. Chukwudi Eze',
  'Mrs. Amina Yusuf',
  'Mr. Tunde Balogun',
  'Mrs. Grace Nwosu',
  'Mr. Samuel Adebisi',
  'Mrs. Esther Ojo',
];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const money = (value: number) => Math.round(value * 100) / 100;

const daysAgo = (days: number) => {
  const date = new Date();
  date.setHours(10, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const hashPassword = (password: string) => bcrypt.hash(password, 12);

const requireEnvironment = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(`${name} is required for the seed.`);
  }

  return value;
};

/*
|--------------------------------------------------------------------------
| Permanent accounts
|--------------------------------------------------------------------------
*/

async function ensurePermanentAccounts() {
  const adminEmail = requireEnvironment(
    PERMANENT_ACCOUNTS.admin.email,
    'SEED_ADMIN_EMAIL',
  );

  const adminPassword = requireEnvironment(
    PERMANENT_ACCOUNTS.admin.password,
    'SEED_ADMIN_PASSWORD',
  );

  const superAdminEmail = requireEnvironment(
    PERMANENT_ACCOUNTS.superAdmin.email,
    'SEED_SUPER_ADMIN_EMAIL',
  );

  const superAdminPassword = requireEnvironment(
    PERMANENT_ACCOUNTS.superAdmin.password,
    'SEED_SUPER_ADMIN_PASSWORD',
  );

  const adminHash = await hashPassword(adminPassword);
  const superAdminHash = await hashPassword(superAdminPassword);

  /*
   * Important:
   * The update operation deliberately does NOT update password.
   *
   * Therefore nightly resets cannot unexpectedly change the
   * permanent administrator credentials.
   */

  await prisma.user.upsert({
    where: {
      email: adminEmail,
    },
    create: {
      name: PERMANENT_ACCOUNTS.admin.name,
      email: adminEmail,
      password: adminHash,
      role: Role.ADMIN,
      isDemo: false,
      active: true,
    },
    update: {
      name: PERMANENT_ACCOUNTS.admin.name,
      role: Role.ADMIN,
      isDemo: false,
      active: true,
    },
  });

  await prisma.user.upsert({
    where: {
      email: superAdminEmail,
    },
    create: {
      name: PERMANENT_ACCOUNTS.superAdmin.name,
      email: superAdminEmail,
      password: superAdminHash,
      role: Role.SUPER_ADMIN,
      isDemo: false,
      active: true,
    },
    update: {
      name: PERMANENT_ACCOUNTS.superAdmin.name,
      role: Role.SUPER_ADMIN,
      isDemo: false,
      active: true,
    },
  });

  console.log('Permanent ADMIN and SUPER_ADMIN verified.');
}

/*
|--------------------------------------------------------------------------
| Demo users
|--------------------------------------------------------------------------
*/

async function createDemoUsers() {
  const demoAdminPasswordHash = await hashPassword(
    DEMO_ACCOUNTS.admin.password,
  );

  const demoSubAdminPasswordHash = await hashPassword(
    DEMO_ACCOUNTS.subAdmin.password,
  );

  await prisma.user.upsert({
    where: {
      email: DEMO_ACCOUNTS.admin.email,
    },
    create: {
      name: DEMO_ACCOUNTS.admin.name,
      email: DEMO_ACCOUNTS.admin.email,
      password: demoAdminPasswordHash,
      role: DEMO_ACCOUNTS.admin.role,
      isDemo: true,
      active: true,
    },
    update: {
      name: DEMO_ACCOUNTS.admin.name,
      password: demoAdminPasswordHash,
      role: DEMO_ACCOUNTS.admin.role,
      isDemo: true,
      active: true,
    },
  });

  await prisma.user.upsert({
    where: {
      email: DEMO_ACCOUNTS.subAdmin.email,
    },
    create: {
      name: DEMO_ACCOUNTS.subAdmin.name,
      email: DEMO_ACCOUNTS.subAdmin.email,
      password: demoSubAdminPasswordHash,
      role: DEMO_ACCOUNTS.subAdmin.role,
      isDemo: true,
      active: true,
    },
    update: {
      name: DEMO_ACCOUNTS.subAdmin.name,
      password: demoSubAdminPasswordHash,
      role: DEMO_ACCOUNTS.subAdmin.role,
      isDemo: true,
      active: true,
    },
  });

  console.log('Demo ADMIN and SUB_ADMIN created.');
}

/*
|--------------------------------------------------------------------------
| Courses
|--------------------------------------------------------------------------
*/

async function createCourses() {
  const courses = await Promise.all(
    COURSE_DEFINITIONS.map((course, index) =>
      prisma.course.create({
        data: {
          ...course,
          image: ASSETS.courses[index].url,
          publicId: ASSETS.courses[index].publicId,
          isActive: true,
        },
      }),
    ),
  );

  console.log(`Created ${courses.length} courses.`);

  return courses;
}

/*
|--------------------------------------------------------------------------
| Sliders
|--------------------------------------------------------------------------
*/

async function createSliders() {
  const sliderContent = [
    {
      title: 'Build Skills That Move Your Career Forward',
      description:
        'Practical technology training designed to help you build real-world skills and confidence.',
    },
    {
      title: 'Learn From Beginner to Job-Ready',
      description:
        'Structured courses, practical projects and hands-on learning for aspiring professionals.',
    },
    {
      title: 'Turn Ideas Into Real Digital Products',
      description:
        'Develop the technical and creative skills needed to build useful digital products.',
    },
    {
      title: 'Your Learning Journey Starts Here',
      description:
        'Explore our courses and start building the skills required for the modern digital economy.',
    },
  ];

  const sliders = await Promise.all(
    sliderContent.map((slider, index) =>
      prisma.slider.create({
        data: {
          ...slider,
          image: ASSETS.sliders[index].url,
          publicId: ASSETS.sliders[index].publicId,
          isActive: true,
        },
      }),
    ),
  );

  console.log(`Created ${sliders.length} sliders.`);
}

/*
|--------------------------------------------------------------------------
| FAQs
|--------------------------------------------------------------------------
*/

async function createFaqs() {
  const faqs = [
    {
      question: 'Can I register for a course at any time?',
      answer:
        'Yes. Academy LMS uses rolling admission, so students can register and begin their learning journey without waiting for a traditional academic semester.',
    },
    {
      question: 'How do I pay for a course?',
      answer:
        'Payments are made offline through the available payment instructions provided by the academy. The dashboard records payments and keeps a complete payment history.',
    },
    {
      question: 'Can I pay for a course in installments?',
      answer:
        'Yes. Students can make multiple payments as long as the total amount paid does not exceed the course fee.',
    },
    {
      question: 'Can I enroll in more than one course?',
      answer:
        'Yes. Students can have multiple course enrollments where appropriate.',
    },
    {
      question: 'What happens after I register?',
      answer:
        'Your registration is recorded and the academy can begin managing your enrollment, payments and learning journey immediately.',
    },
    {
      question: 'How is my outstanding balance calculated?',
      answer:
        'The outstanding balance is calculated from the course fee minus the total payments recorded against the enrollment.',
    },
    {
      question: 'Can I start a course immediately?',
      answer:
        'Yes. Academy LMS is designed around rolling admission, allowing students to start without waiting for a new semester.',
    },
    {
      question: 'Do you offer frontend development training?',
      answer:
        'Yes. Academy LMS provides frontend, React, backend, Node.js and full-stack development courses among other technology programmes.',
    },
    {
      question: 'Can my payment history be viewed?',
      answer:
        'Yes. Each payment is recorded separately so administrators can review the complete payment history for an enrollment.',
    },
    {
      question: 'Can administrators update course information?',
      answer:
        'Yes. Authorized administrators can create, update and manage courses from the admin dashboard.',
    },
    {
      question: 'Can administrators manage website content?',
      answer:
        'Yes. Authorized administrators can manage sliders, FAQs and application settings from the dashboard.',
    },
    {
      question: 'Does Academy LMS process online payments?',
      answer:
        'No. Academy LMS records payments made through offline channels such as cash or bank transfer. It does not process online payments.',
    },
  ];

  await prisma.faq.createMany({
    data: faqs.map((faq) => ({
      ...faq,
      isActive: true,
    })),
  });

  console.log(`Created ${faqs.length} FAQs.`);
}

/*
|--------------------------------------------------------------------------
| Settings
|--------------------------------------------------------------------------
*/

async function createSettings() {
  await prisma.setting.create({
    data: {
      id: DEFAULT_SETTINGS_ID,

      appName: 'Academy LMS',
      appDescription: 'A modern learning management system',
      contactEmail: 'afolabiquadri28@gmail.com',

      logoUrl: ASSETS.settings.logo.url,
      logoUrlPublicId: ASSETS.settings.logo.publicId,

      favicon: ASSETS.settings.favicon.url,
      faviconPublicId: ASSETS.settings.favicon.publicId,

      logoText: 'Academy LMS',

      defaultStudentPhoto: ASSETS.settings.defaultStudentPhoto.url,

      defaultStudentPhotoPublicId: ASSETS.settings.defaultStudentPhoto.publicId,

      themeMode: ThemeMode.LIGHT,

      primaryColor: '#eeeeee',
      secondaryColor: '#1b1b1b',
      accentColor: '#1b1b1b',
      backgroundColor: '#070707',

      timezone: 'Africa/Lagos',
      currency: Currency.NGN,
    },
  });

  console.log('Created Academy LMS settings.');
}

/*
|--------------------------------------------------------------------------
| Students
|--------------------------------------------------------------------------
*/

async function createStudents() {
  const students = [];

  for (let index = 0; index < 80; index++) {
    const firstname = FIRST_NAMES[index % FIRST_NAMES.length];

    const surname = SURNAMES[index % SURNAMES.length];

    const otherName = OTHER_NAMES[index % OTHER_NAMES.length];

    const parentName = PARENT_NAMES[index % PARENT_NAMES.length];

    const email = `${firstname.toLowerCase()}.${surname.toLowerCase()}.${index + 1}@demo.academylms.test`;

    const phone = `080${String(30000000 + index).slice(-8)}`;

    const parentsPhone = `081${String(40000000 + index).slice(-8)}`;

    const createdAt = daysAgo(175 - ((index * 11) % 160));

    const dateOfBirth = new Date(
      1997 + (index % 9),
      index % 12,
      5 + (index % 20),
    );

    students.push({
      firstname,
      surname,
      otherName,
      dateOfBirth,
      email,
      phone,
      address: `${20 + index} ${['Allen Avenue', 'Awolowo Road', 'Airport Road', 'Adetokunbo Ademola Street', 'Ikorodu Road'][index % 5]}, ${['Ikeja', 'Yaba', 'Surulere', 'Lekki', 'Maryland'][index % 5]}, Lagos`,
      photo: ASSETS.settings.defaultStudentPhoto.url,
      publicId: ASSETS.settings.defaultStudentPhoto.publicId,
      parentName,
      parentsPhone,
      parentsAddress: `${12 + index} ${['Allen Avenue', 'Herbert Macaulay Way', 'Opebi Road', 'Ikorodu Road'][index % 4]}, Lagos`,
      createdAt,
      active: true,
    });
  }

  await prisma.student.createMany({
    data: students,
  });

  console.log(`Created ${students.length} students.`);

  return prisma.student.findMany({
    where: {
      email: {
        endsWith: '@demo.academylms.test',
      },
    },
    orderBy: {
      id: 'asc',
    },
  });
}

/*
|--------------------------------------------------------------------------
| Enrollment + payment generation
|--------------------------------------------------------------------------
|
| Payment states:
|
| 20% fully paid
| 20% fully paid in installments
| 30% partially paid
| 20% unpaid
| 10% mostly paid / outstanding balance
|
*/

async function createEnrollmentsAndPayments(
  students: Awaited<ReturnType<typeof createStudents>>,
  courses: Awaited<ReturnType<typeof createCourses>>,
) {
  const enrollmentRows = [];
  const paymentRows = [];

  let enrollmentSequence = 0;

  for (let index = 0; index < students.length; index++) {
    const student = students[index];

    const primaryCourse = courses[index % courses.length];

    enrollmentRows.push({
      studentId: student.id,
      courseId: primaryCourse.id,
      createdAt: daysAgo(160 - ((index * 7) % 145)),
    });

    enrollmentSequence++;

    /*
     * Some students take a second course.
     *
     * This gives the dashboard realistic multi-course
     * enrollment data.
     */
    if (index % 7 === 0) {
      const secondaryCourse = courses[(index + 3) % courses.length];

      if (secondaryCourse.id !== primaryCourse.id) {
        enrollmentRows.push({
          studentId: student.id,
          courseId: secondaryCourse.id,
          createdAt: daysAgo(90 - ((index * 3) % 75)),
        });

        enrollmentSequence++;
      }
    }
  }

  await prisma.enrollment.createMany({
    data: enrollmentRows,
  });

  const enrollments = await prisma.enrollment.findMany({
    where: {
      student: {
        email: {
          endsWith: '@demo.academylms.test',
        },
      },
    },
    include: {
      course: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

  for (let index = 0; index < enrollments.length; index++) {
    const enrollment = enrollments[index];

    const fee = enrollment.course.fee;

    /*
     * Rotate through different payment scenarios.
     */
    const scenario = index % 10;

    if (scenario === 0 || scenario === 1) {
      // Fully paid in one payment.
      paymentRows.push({
        amount: fee,
        enrollmentId: enrollment.id,
        createdAt: daysAgo(130 - ((index * 5) % 100)),
        reference: `DEMO-PAY-${String(index + 1).padStart(4, '0')}-FULL`,
      });
    } else if (scenario === 2 || scenario === 3) {
      // Half paid.
      paymentRows.push({
        amount: money(fee * 0.5),
        enrollmentId: enrollment.id,
        createdAt: daysAgo(95 - ((index * 4) % 70)),
        reference: `DEMO-PAY-${String(index + 1).padStart(4, '0')}-PARTIAL`,
      });
    } else if (scenario === 4) {
      // Three-installment payment history.
      const first = money(fee * 0.3);
      const second = money(fee * 0.3);
      const third = money(fee * 0.2);

      paymentRows.push(
        {
          amount: first,
          enrollmentId: enrollment.id,
          createdAt: daysAgo(110),
          reference: `DEMO-PAY-${String(index + 1).padStart(4, '0')}-01`,
        },
        {
          amount: second,
          enrollmentId: enrollment.id,
          createdAt: daysAgo(75),
          reference: `DEMO-PAY-${String(index + 1).padStart(4, '0')}-02`,
        },
        {
          amount: third,
          enrollmentId: enrollment.id,
          createdAt: daysAgo(35),
          reference: `DEMO-PAY-${String(index + 1).padStart(4, '0')}-03`,
        },
      );
    } else if (scenario === 5 || scenario === 6) {
      // Completely unpaid.
      continue;
    } else if (scenario === 7) {
      // Small first payment.
      paymentRows.push({
        amount: money(fee * 0.25),
        enrollmentId: enrollment.id,
        createdAt: daysAgo(65 - ((index * 3) % 40)),
        reference: `DEMO-PAY-${String(index + 1).padStart(4, '0')}-DEPOSIT`,
      });
    } else if (scenario === 8) {
      // Fully paid in two installments.
      const first = money(fee * 0.6);
      const second = money(fee - first);

      paymentRows.push(
        {
          amount: first,
          enrollmentId: enrollment.id,
          createdAt: daysAgo(85),
          reference: `DEMO-PAY-${String(index + 1).padStart(4, '0')}-01`,
        },
        {
          amount: second,
          enrollmentId: enrollment.id,
          createdAt: daysAgo(28),
          reference: `DEMO-PAY-${String(index + 1).padStart(4, '0')}-02`,
        },
      );
    } else {
      // Mostly paid with small outstanding balance.
      paymentRows.push({
        amount: money(fee * 0.8),
        enrollmentId: enrollment.id,
        createdAt: daysAgo(50 - ((index * 2) % 30)),
        reference: `DEMO-PAY-${String(index + 1).padStart(4, '0')}-PARTIAL`,
      });
    }
  }

  await prisma.payment.createMany({
    data: paymentRows,
  });

  console.log(
    `Created ${enrollments.length} enrollments and ${paymentRows.length} payments.`,
  );

  return {
    enrollments,
    paymentRows,
  };
}

/*
|--------------------------------------------------------------------------
| Accounting validation
|--------------------------------------------------------------------------
*/

async function validateAccounting() {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      student: {
        email: {
          endsWith: '@demo.academylms.test',
        },
      },
    },
    include: {
      course: true,
      payments: true,
    },
  });

  for (const enrollment of enrollments) {
    const totalPaid = money(
      enrollment.payments.reduce((sum, payment) => sum + payment.amount, 0),
    );

    if (totalPaid > enrollment.course.fee) {
      throw new Error(
        `ACCOUNTING ERROR: Enrollment ${enrollment.id} has paid ${totalPaid} against course fee ${enrollment.course.fee}`,
      );
    }
  }

  console.log('Accounting validation passed: no enrollment is overpaid.');
}

/*
|--------------------------------------------------------------------------
| Seed reset
|--------------------------------------------------------------------------
*/

async function resetDemoData() {
  console.log('Resetting demo/application data...');

  /*
   * Payments depend on enrollments.
   */
  await prisma.payment.deleteMany();

  /*
   * Enrollments depend on students and courses.
   */
  await prisma.enrollment.deleteMany();

  /*
   * These are entirely resettable application records.
   */
  await prisma.student.deleteMany();
  await prisma.course.deleteMany();
  await prisma.slider.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.setting.deleteMany();

  /*
   * Only demo users are deleted.
   *
   * Permanent ADMIN and SUPER_ADMIN accounts remain untouched.
   */
  await prisma.user.deleteMany({
    where: {
      isDemo: true,
    },
  });

  console.log('Demo/application data cleared.');
}

/*
|--------------------------------------------------------------------------
| Main
|--------------------------------------------------------------------------
*/

async function main() {
  console.log('');
  console.log('==============================================');
  console.log(' Academy LMS Demo Seed');
  console.log('==============================================');
  console.log('');

  /*
   * Always verify the permanent accounts first.
   *
   * They are upserted rather than deleted.
   */
  await ensurePermanentAccounts();

  /*
   * Everything below this point is resettable.
   */
  await resetDemoData();

  await createDemoUsers();

  await createSettings();

  await createSliders();

  await createFaqs();

  const courses = await createCourses();

  const students = await createStudents();

  await createEnrollmentsAndPayments(students, courses);

  await validateAccounting();

  /*
   * Final sanity checks.
   */
  const [
    studentCount,
    courseCount,
    enrollmentCount,
    paymentCount,
    sliderCount,
    faqCount,
    demoUserCount,
    permanentUserCount,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.payment.count(),
    prisma.slider.count(),
    prisma.faq.count(),
    prisma.user.count({
      where: {
        isDemo: true,
      },
    }),
    prisma.user.count({
      where: {
        isDemo: false,
      },
    }),
  ]);

  console.log('');
  console.log('==============================================');
  console.log(' Seed completed successfully');
  console.log('==============================================');
  console.log(`Students:       ${studentCount}`);
  console.log(`Courses:        ${courseCount}`);
  console.log(`Enrollments:    ${enrollmentCount}`);
  console.log(`Payments:       ${paymentCount}`);
  console.log(`Sliders:        ${sliderCount}`);
  console.log(`FAQs:           ${faqCount}`);
  console.log(`Demo users:     ${demoUserCount}`);
  console.log(`Permanent users:${permanentUserCount}`);
  console.log('');
  console.log('Demo ADMIN:', DEMO_ACCOUNTS.admin.email);
  console.log('Demo SUB_ADMIN:', DEMO_ACCOUNTS.subAdmin.email);
  console.log('');
}

main()
  .catch((error) => {
    console.error('');
    console.error('SEED FAILED');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
