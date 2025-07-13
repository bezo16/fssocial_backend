import { BadRequestException } from '@nestjs/common';
import * as argon2 from 'argon2';

const verifyPassword = async (
  passwordHash: string,
  plainPassword: string,
): Promise<void> => {
  try {
    const isPasswordValid = await argon2.verify(passwordHash, plainPassword);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid username or password.');
    }
  } catch (error) {
    console.error('Password verification failed:', error);
    throw new BadRequestException('Invalid username or password.');
  }
};

export default verifyPassword;
