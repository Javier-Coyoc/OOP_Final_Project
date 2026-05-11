export abstract class UserDef {
  protected id!: number;
  protected username!: string;
  protected password!: string;
  protected role!: string;
  protected full_name!: string;
  protected email!: string;
  protected is_active!: boolean;

  abstract getId(): number;
  abstract getUsername(): string;
  abstract getRole(): string;
  abstract getFullName(): string;
  abstract getEmail(): string;
  abstract getIsActive(): boolean;

  abstract setRole(role: string): void;
  abstract setFullName(full_name: string): void;
  abstract setEmail(email: string): void;
  abstract setIsActive(is_active: boolean): void;

  abstract checkPassword(input: string): boolean;
}
