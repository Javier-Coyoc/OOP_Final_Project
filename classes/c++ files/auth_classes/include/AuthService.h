#ifndef AUTHSERVICE_H
#define AUTHSERVICE_H

#include <vector>
#include "User.h"
using namespace std;

class AuthService {
private:
    vector<User> users;         // hardcoded list of accounts
    User*        current_user;  // who is currently logged in

public:
    AuthService();
    ~AuthService();

    bool   login(string username, string password);
    void   logout();
    bool   isLoggedIn();
    User*  getCurrentUser();
    bool   registerUser(int id, string username, string password, string role, string full_name, string email);
};

#endif
