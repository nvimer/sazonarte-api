// Mock for @faker-js/faker to avoid ES module issues in Jest
// Jest will automatically use this mock when @faker-js/faker is imported in tests

const mockFaker = {
  person: {
    firstName: () => "John",
    lastName: () => "Doe",
  },
  internet: {
    email: () => "test@example.com",
    password: (options?: { length?: number }) => {
      const length = options?.length || 12;
      return "a".repeat(length);
    },
    url: () => "https://example.com",
  },
  phone: {
    number: () => "1234567890",
  },
  location: {
    streetAddress: () => "123 Test St",
  },
  string: {
    alphanumeric: (length: number) => "a".repeat(length),
  },
};

export const faker = mockFaker;
export default mockFaker;
