import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let userModel: jest.Mocked<any>;

  const mockUser = {
    _id: '60f7b3b3b3f3f3f3f3f3f3f3',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: UserRole.USER,
    isActive: true,
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn().mockResolvedValue(this),
  };

  const mockUserModel = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue(data),
  })) as any;

  mockUserModel.find = jest.fn();
  mockUserModel.findOne = jest.fn();
  mockUserModel.findById = jest.fn();
  mockUserModel.findByIdAndUpdate = jest.fn();
  mockUserModel.create = jest.fn();
  mockUserModel.save = jest.fn();
  mockUserModel.exec = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.USER,
    };

    it('should create a new user successfully', async () => {
      mockBcrypt.hash.mockResolvedValue('hashedPassword123' as never);

      const mockUserInstance = {
        ...mockUser,
        save: jest.fn().mockResolvedValue(mockUser),
      };

      // Mock the model constructor
      mockUserModel.mockImplementation(() => mockUserInstance);

      const result = await service.create(userData);

      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw error if password is not provided', async () => {
      const userDataWithoutPassword = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };

      await expect(
        service.create(userDataWithoutPassword as any),
      ).rejects.toThrow('Password is required');
    });
  });

  describe('findById', () => {
    it('should find user by id successfully', async () => {
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      const result = await service.findById(mockUser._id);

      expect(userModel.findById).toHaveBeenCalledWith(mockUser._id);
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const result = await service.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email successfully', async () => {
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      const result = await service.findByEmail(mockUser.email);

      expect(userModel.findOne).toHaveBeenCalledWith({ email: mockUser.email });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('updateRefreshToken', () => {
    it('should update refresh token successfully', async () => {
      const refreshToken = 'new_refresh_token';
      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      await service.updateRefreshToken(mockUser._id, refreshToken);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(mockUser._id, {
        refreshToken,
        lastLoginAt: expect.any(Date),
      });
    });

    it('should set refresh token to null when logging out', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      await service.updateRefreshToken(mockUser._id, null);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(mockUser._id, {
        refreshToken: null,
        lastLoginAt: expect.any(Date),
      });
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      mockBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validatePassword(
        'password123',
        'hashedPassword123',
      );

      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123',
      );
      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      mockBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validatePassword(
        'wrongpassword',
        'hashedPassword123',
      );

      expect(result).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should find all active users', async () => {
      const mockUsers = [mockUser, { ...mockUser, _id: 'another-id' }];
      userModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUsers),
      } as any);

      const result = await service.findAll();

      expect(userModel.find).toHaveBeenCalledWith({ isActive: true });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updateData };

      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUser),
      } as any);

      const result = await service.updateUser(mockUser._id, updateData);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUser._id,
        { ...updateData, updatedAt: expect.any(Date) },
        { new: true },
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        service.updateUser('nonexistent-id', { name: 'Updated Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user successfully', async () => {
      const deactivatedUser = { ...mockUser, isActive: false };
      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(deactivatedUser),
      } as any);

      await service.deactivateUser(mockUser._id);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUser._id,
        { isActive: false, updatedAt: expect.any(Date) },
        { new: true },
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.deactivateUser('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
