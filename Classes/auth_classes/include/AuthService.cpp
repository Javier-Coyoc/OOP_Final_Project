#include "AuthService.h"
#include <iostream>
using namespace std;

AuthService::AuthService() {
    current_user = nullptr;

    // Hardcoded test accounts
    users.push_back(User(1, "admin",   "admin123",    "manager", "Admin User",    "admin@store.com"));
    users.push_back(User(2, "john",    "john123",     "cashier", "John Smith",    "john@store.com"));
    users.push_back(User(3, "sarah",   "sarah123",    "cashier", "Sarah Johnson", "sarah@store.com"));
    users.push_back(User(4, "manager", "manager123",  "manager", "Store Manager", "manager@store.com"));
}

AuthService::~AuthService() {
    current_user = nullptr;
}

bool AuthService::login(string username, string password) {
    if (isLoggedIn()) {
        cout << "A user is already logged in. Please log out first." << endl;
        return false;
    }

    for (int i = 0; i < (int)users.size(); i++) {
        if (users[i].getUsername() == username) {
            if (!users[i].getIsActive()) {
                cout << "Account is disabled. Please contact a manager." << endl;
                return false; 
            }
            if (users[i].checkPassword(password)) {
                current_user = &users[i];
                cout << "Welcome, " << current_user->getFullName()
                     << " (" << current_user->getRole() << ")!" << endl;
                return true;
            } else {
                cout << "Incorrect password." << endl;
                return false;
            }
        }
    }

    cout << "Username not found." << endl;
    return false;
}

void AuthService::logout() {
    if (!isLoggedIn()) {
        cout << "No user is currently logged in." << endl;
        return;
    }
    cout << "Goodbye, " << current_user->getFullName() << "!" << endl;
    current_user = nullptr;
}

bool AuthService::isLoggedIn() {
    return current_user != nullptr;
}

User* AuthService::getCurrentUser() {
    return current_user;
}

bool AuthService::registerUser(int id, string username, string password, string role, string full_name, string email) {
    // Check if username already exists
    for (int i = 0; i < users.size(); i++) {
        if (users[i].getUsername() == username) {
            cout << "Username already taken: " << username << endl;
            return false;
        }
    }
    users.push_back(User(id, username, password, role, full_name, email));
    cout << "User registered successfully: " << username << endl;
    return true;
}
