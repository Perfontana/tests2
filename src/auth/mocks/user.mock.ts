import { idGenerator } from '../../testing/id-generator';

const getId = idGenerator();

const mockData = [];

export const userMock = {
  sequelize: {
    transaction: jest.fn(),
  },
  findAll: jest.fn(() => mockData),
  findOne: jest.fn(({ where }) => {
    return mockData.find((u) =>
      Object.entries(where).every(([key, value]) => u[key] === value),
    );
  }),
  create: jest.fn((data) => {
    const createdUser = { ...data, id: String(getId.next().value) };
    mockData.push(createdUser);
    return createdUser;
  }),
  update: jest.fn((data) => {
    const index = mockData.findIndex((u) => u.id === data.id);
    if (index >= 0) {
      mockData.splice(index, 1);
    }
    mockData.push(data);
  }),
};
