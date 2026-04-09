#include "User.h"

User::User(int id, string username, string password, string role, string full_name, string email) {
    this->id        = id;
    this->username  = username;
    this->password  = password;
    this->role      = role;
    this->full_name = full_name;
    this->email     = email;
    this->is_active = true;  // active by default on creation
}

User::~User() {}

// Getters
int    User::getId()       { return id; }
string User::getUsername() { return username; }
string User::getRole()     { return role; }
string User::getFullName() { return full_name; }
string User::getEmail()    { return email; }
bool   User::getIsActive() { return is_active; }

// Setters
void User::setRole(string role)         { this->role      = role; }
void User::setFullName(string full_name){ this->full_name  = full_name; }
void User::setEmail(string email)       { this->email      = email; }
void User::setIsActive(bool is_active)  { this->is_active  = is_active; }

// Check password — compares input against stored password
bool User::checkPassword(string input) {
    return input == password;
}
