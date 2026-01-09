// Test básico para verificar configuración de Jest
describe("Configuration Tests", () => {
  test("should have Jest properly configured", () => {
    expect(true).toBe(true);
  });

  test("should support TypeScript", () => {
    const message: string = "Hello TypeScript";
    expect(message).toBe("Hello TypeScript");
  });

  test("should support async/await", async () => {
    const result = await Promise.resolve("async test");
    expect(result).toBe("async test");
  });
});
