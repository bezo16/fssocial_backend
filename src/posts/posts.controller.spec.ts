import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from 'lib/auth/JwtAuthGuard';

// Mock the database connection
jest.mock('lib/drizzle', () => ({
  default: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock the schema
jest.mock('lib/drizzle/schema', () => ({
  postsTable: { id: 'id', content: 'content', userId: 'userId' },
  usersTable: { id: 'id', username: 'username', email: 'email' },
  commentsTable: { id: 'id', content: 'content', postId: 'postId' },
  followsTable: { followerId: 'followerId', followingId: 'followingId' },
}));

describe('PostsController', () => {
  let controller: PostsController;
  let mockPostsService: Partial<PostsService>;
  let mockJwtService: Partial<JwtService>;

  beforeEach(async () => {
    // Create mock services
    mockPostsService = {
      createPost: jest.fn().mockResolvedValue({ id: 1, content: 'Test post' }),
      findAll: jest.fn().mockResolvedValue([{ id: 1, content: 'Test post' }]),
      findFeedPosts: jest
        .fn()
        .mockResolvedValue([{ id: 1, content: 'Test post' }]),
    };

    mockJwtService = {
      verify: jest.fn().mockReturnValue({ id: 1, email: 'test@example.com' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
