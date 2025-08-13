import bcrypt from 'bcryptjs';

export const hashPassword = async (plain) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

export const comparePassword = (plain, hashed) => bcrypt.compare(plain, hashed);