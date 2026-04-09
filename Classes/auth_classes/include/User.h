#ifndef USER_H
#define USER_H

#include <string>
using namespace std;

class User {
private:
    int    id;
    string username;
    string password;
    string role;
    string full_name;
    string email;
    bool   is_active;

public:
    User(int id, string username, string password, string role, string full_name, string email);
    ~User();

    // Getters
    int    getId();
    string getUsername();
    string getRole();
    string getFullName();
    string getEmail();
    bool   getIsActive();

    // Setters
    void setRole(string role);
    void setFullName(string full_name);
    void setEmail(string email);
    void setIsActive(bool is_active);

    // Password check — never returns raw password
    bool checkPassword(string input);
};

#endif
