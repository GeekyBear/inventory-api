import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(userData: Partial<User>): Promise<User> {
    if (!userData.password) {
      throw new Error('Password is required');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const user = new this.userModel({
      ...userData,
      password: hashedPassword,
    });
    return user.save();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        refreshToken,
        lastLoginAt: new Date(),
      })
      .exec();
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find({ isActive: true }).exec();
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true },
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async deactivateUser(id: string): Promise<void> {
    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { isActive: false, updatedAt: new Date() },
        { new: true },
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }
}
