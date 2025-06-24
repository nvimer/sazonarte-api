import { User } from "@prisma/client";
import { LoginInput } from "../auth.validator";

/**
 * Auth Service Interface
 *
 * Defines the contract for authentication service implementations.
 * This interface ensures consistency across different authentication service
 * implementations and provides clear documentation of expected methods.
 *
 * The interface defines core authentication operations:
 * - User login and credential validation
 * - Password verification and security
 * - User data protection and sanitization
 *
 * This interface is essential for:
 * - Dependency injection and testing
 * - Service layer consistency
 * - Clear API documentation
 * - Maintainable code architecture
 */
export interface AuthServiceInterface {
  login(data: LoginInput): Promise<User>;
}
