import { Repository } from "typeorm";
import { IUsersService } from "../Domain/services/IUsersService";
import { User } from "../Domain/models/User";
import { UserDTO } from "../Domain/DTOs/UserDTO";

export class UsersService implements IUsersService {
  constructor(private userRepository: Repository<User>) {}

  /**
   * Get all users
   */
  async getAllUsers(): Promise<UserDTO[]> {
    const users = await this.userRepository.find();
    return users.map(u => this.toDTO(u));
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<UserDTO> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new Error(`User with ID ${id} not found`);
    return this.toDTO(user);
  }

  /**
   * Create a new user
   */
  async createUser(user: User): Promise<UserDTO> {
    const newUser = this.userRepository.create(user);
    const savedUser = await this.userRepository.save(newUser);
    return this.toDTO(savedUser);
  }

  /**
   * Update existing user
   */
  async updateUser(id: number, user: User): Promise<UserDTO> {
    const existingUser = await this.userRepository.findOne({ where: { id } });
    if (!existingUser) throw new Error(`User with ID ${id} not found`);

    const updated = { ...existingUser, ...user };
    const savedUser = await this.userRepository.save(updated);
    return this.toDTO(savedUser);
  }

  /**
   * Delete a user
   */
  async deleteUser(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  /**
   * Convert User entity to UserDTO
   */
  private toDTO(user: User): UserDTO {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage ?? "",
      name: user.name,
      surname: user.surname
    };
  }
}
