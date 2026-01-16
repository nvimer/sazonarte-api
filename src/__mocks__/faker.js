// Mock completo de faker para tests
const faker = {
  person: {
    firstName: () => "John",
    lastName: () => "Doe",
    fullName: () => "John Doe",
  },
  internet: {
    email: () => "test@example.com",
    password: (options) => {
      const length = typeof options === "object" ? options?.length || 8 : options || 8;
      return "password".repeat(Math.ceil(length / 8)).substring(0, length);
    },
    url: () => "https://example.com",
    domainName: () => "example.com",
  },
  phone: {
    number: () => "1234567890",
  },
  string: {
    uuid: () => "123e4567-e89b-12d3-a456-426614174000",
    alphanumeric: (length) => "a".repeat(length || 10),
  },
  datatype: {
    boolean: () => true,
  },
  date: {
    past: () => new Date(),
    recent: () => new Date(),
  },
  location: {
    streetAddress: () => "123 Main St",
  },
};

module.exports = { faker };
module.exports.default = { faker };
