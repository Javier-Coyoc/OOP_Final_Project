import { UserDef } from "./UserDef";

export class User extends UserDef {
  constructor(id: number, username: string, password: string, role: string, full_name: string, email: string) {
    super();
    this.setId(id);
    this.setUsername(username);
    this.setPassword(password);
    this.setRole(role);
    this.setFullName(full_name);
    this.setEmail(email);
    this.is_active = true;
  }

  getId(): number        { return this.id; }
  getUsername(): string  { return this.username; }
  getRole(): string      { return this.role; }
  getFullName(): string  { return this.full_name; }
  getEmail(): string     { return this.email; }
  getIsActive(): boolean { return this.is_active; }

  setId(id: number): void                 { this.id        = id; }
  setUsername(username: string): void     { this.username  = username; }
  setPassword(password: string): void     { this.password  = password; }
  setRole(role: string): void             { this.role      = role; }
  setFullName(full_name: string): void    { this.full_name = full_name; }
  setEmail(email: string): void           { this.email     = email; }
  setIsActive(is_active: boolean): void   { this.is_active = is_active; }

  checkPassword(input: string): boolean { return input === this.password; }
}
