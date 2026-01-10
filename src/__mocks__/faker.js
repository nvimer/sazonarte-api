module.exports = {
  person: {
    firstName: () => "John",
    lastName: () => "Doe",
  },
  internet: {
    email: () => "test@example.com",
    password: (options) => "password".repeat(options?.length || 8),
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
