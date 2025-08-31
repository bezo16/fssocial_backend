import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';

// Mock the database connection
jest.mock('lib/drizzle', () => ({
  default: {
    select: jest.fn(),
    insert: jest.fn(),
    from: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    returning: jest.fn(),
    values: jest.fn(),
    innerJoin: jest.fn(),
    limit: jest.fn(),
  },
}));

// Mock the schema
jest.mock('lib/drizzle/schema', () => ({
  postsTable: {
    id: 'id',
    content: 'content',
    title: 'title',
    imageUrl: 'imageUrl',
    authorId: 'authorId',
    createdAt: 'createdAt',
  },
  usersTable: { id: 'id', username: 'username', email: 'email' },
  commentsTable: {
    id: 'id',
    content: 'content',
    targetId: 'targetId',
    targetType: 'targetType',
  },
  followsTable: { followerId: 'followerId', followingId: 'followingId' },
}));

// Mock drizzle-orm functions
jest.mock('drizzle-orm', () => ({
  desc: jest.fn((field) => `desc(${field})`),
  eq: jest.fn((field, value) => `${field} = ${value}`),
  sql: jest.fn((template: TemplateStringsArray) => ({
    as: jest.fn((alias: string) => `${template.raw.join('')} AS ${alias}`),
  })),
}));

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsService],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
