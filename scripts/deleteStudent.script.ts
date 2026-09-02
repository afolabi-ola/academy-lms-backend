import prisma from '../src/lib/prisma';

const deleteStudent = async (studentId: string, courseId: string) => {
  // Implementation for deleting a student from the database

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: Number(studentId),
        courseId: Number(courseId),
      },
    },
  });

  if (!enrollment) {
    console.log(
      `No enrollment found for student ID ${studentId} and course ID ${courseId}`,
    );
    return;
  }

  await prisma.payment.deleteMany({
    where: {
      enrollmentId: enrollment?.id,
    },
  });

  console.log(`Deleted all payments for enrollment id ${enrollment?.id}`);

  await prisma.enrollment.delete({
    where: {
      studentId_courseId: {
        studentId: Number(studentId),
        courseId: Number(courseId),
      },
    },
  });

  console.log(
    `Deleted enrollment for student ID ${studentId} and course ID ${courseId}`,
  );

  await prisma.student.delete({
    where: {
      id: Number(studentId),
    },
  });

  console.log(`Deleted student with ID ${studentId}`);
};

// Example usage: node deleteStudent.script.js <studentId> <courseId>
const studentId = process.argv[2];
const courseId = process.argv[3];

if (!studentId || !courseId) {
  console.error('Please provide both student ID and course ID as arguments');
  process.exit(1);
}

deleteStudent(studentId, courseId)
  .then(() => {
    console.log('Student deletion completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error deleting student:', error);
    process.exit(1);
  });
