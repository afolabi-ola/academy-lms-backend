import prisma from '../../lib/prisma';
import bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  //Create a hashed password using bcrypt
  const passwordHash = await bcrypt.hash(password, 12);
  // Return the hashed password
  return passwordHash;
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  // Compare the provided password with the hashed password using bcrypt
  const isMatch = await bcrypt.compare(password, hashedPassword);

  // Return true if passwords match, false otherwise
  return isMatch;
};

export const createUser = async function (user: {
  name: string;
  email: string;
  password: string;
}) {
  const hashedPassword = await hashPassword(user.password);

  return await prisma.user.create({
    data: { ...user, password: hashedPassword },
  });
};
