"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const UserDef_1 = require("./UserDef");
class User extends UserDef_1.UserDef {
    constructor(id, username, password, role, full_name, email) {
        super();
        this.setId(id);
        this.setUsername(username);
        this.setPassword(password);
        this.setRole(role);
        this.setFullName(full_name);
        this.setEmail(email);
        this.is_active = true;
    }
    getId() { return this.id; }
    getUsername() { return this.username; }
    getRole() { return this.role; }
    getFullName() { return this.full_name; }
    getEmail() { return this.email; }
    getIsActive() { return this.is_active; }
    setId(id) { this.id = id; }
    setUsername(username) { this.username = username; }
    setPassword(password) { this.password = password; }
    setRole(role) { this.role = role; }
    setFullName(full_name) { this.full_name = full_name; }
    setEmail(email) { this.email = email; }
    setIsActive(is_active) { this.is_active = is_active; }
    checkPassword(input) { return input === this.password; }
}
exports.User = User;
