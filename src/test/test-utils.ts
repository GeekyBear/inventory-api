import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

export class TestDatabaseHelper {
    private static mongoServer: MongoMemoryServer;
    private static connection: Connection;

    static async startDatabase(): Promise<string> {
        this.mongoServer = await MongoMemoryServer.create();
        return this.mongoServer.getUri();
    }

    static async closeDatabase(): Promise<void> {
        if (this.connection) {
            await this.connection.close();
        }
        if (this.mongoServer) {
            await this.mongoServer.stop();
        }
    }

    static async clearDatabase(moduleRef: TestingModule): Promise<void> {
        this.connection = moduleRef.get(getConnectionToken());
        const collections = this.connection.collections;

        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    }

    static createTestingModule(imports: any[], providers: any[] = [], controllers: any[] = []) {
        return Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: '.env.test',
                }),
                MongooseModule.forRootAsync({
                    useFactory: async () => ({
                        uri: await this.startDatabase(),
                    }),
                }),
                ...imports,
            ],
            providers,
            controllers,
        });
    }
}

export const createMockRepository = () => ({
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
    exec: jest.fn(),
    populate: jest.fn(),
    sort: jest.fn(),
    limit: jest.fn(),
    skip: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
});

export const mockModel = {
    new: jest.fn().mockResolvedValue(createMockRepository()),
    constructor: jest.fn().mockResolvedValue(createMockRepository()),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    exec: jest.fn(),
    populate: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    sort: jest.fn(),
    select: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
};
