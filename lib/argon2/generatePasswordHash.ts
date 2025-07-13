import * as argon2 from 'argon2';
import { InternalServerErrorException } from '@nestjs/common';

const generatePasswordHash = async (password: string): Promise<string> => {
  try {
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 4,
      parallelism: 1,
    });

    return passwordHash;
  } catch (error) {
    console.error('Error generating password hash: \n', error);
    throw new InternalServerErrorException('Failed to generate password hash');
  }
};

export default generatePasswordHash;
