import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import db from 'lib/drizzle';
import { usersTable } from 'lib/drizzle/schema';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  async register(createAuthDto: CreateAuthDto) {
    let passwordHash: string;
    try {
      passwordHash = await argon2.hash(createAuthDto.password, {
        type: argon2.argon2id, // Odporúčaný typ pre heslá
        memoryCost: 2 ** 16, // 65536 kB = 64 MB (príklad, môžeš prispôsobiť)
        timeCost: 4, // Počet iterácií
        parallelism: 1, // Počet paralelných vlákien
        // saltLength: 16,      // Predvolená dĺžka soli je 16, môžeš ju zmeniť
      });
    } catch (err) {
      console.error('Error hashing password with Argon2:', err);
      throw new BadRequestException('Failed to hash password.');
    }
    const [createdUser] = await db
      .insert(usersTable)
      .values({
        username: createAuthDto.username,
        email: createAuthDto.email,
        password_hash: passwordHash,
      })
      .returning();

    return createdUser;
  }

  login() {
    return `This action login user`;
  }
}
