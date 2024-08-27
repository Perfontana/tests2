import { idGenerator } from '../../testing/id-generator';

const getId = idGenerator();

const mockData = [
  {
    id: 'test',
    title: 'Title 1',
    text: 'Text 1',
    image: 'Image 1',
    authorId: '1',
    tags: 'tag1, tag2',
  },
];

export const postMock = {
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
    const createdPost = { ...data, id: String(getId.next().value) };
    mockData.push(createdPost);
    return createdPost;
  }),
  update: jest.fn((data, { where }) => {
    const index = mockData.findIndex((u) =>
      Object.entries(where).every(([key, value]) => u[key] === value),
    );
    const existingPost = mockData[index];

    if (index < 0) {
      return;
    }

    mockData.splice(index, 1);
    const updatedData = { ...existingPost, ...data };
    mockData.push(updatedData);
    return updatedData;
  }),
};
