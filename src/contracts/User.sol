// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;


contract User {
    struct UserData {
        string username;
        string password;
        uint role;
    }

    mapping(uint => UserData) private usersByUserId;
    mapping(string => UserData) private usersByUsername;
    uint private nextUserId = 1;

     function registerUser(string memory _username, string memory _password, uint _role) public {
        require(bytes(usersByUsername[_username].username).length == 0, "Username already exists");

       
        UserData memory newUser = UserData(_username, _password, _role);
        usersByUserId[nextUserId] = newUser;
        usersByUsername[_username] = newUser;
        nextUserId++;
    }

    function login(string memory _username, string memory _password) public view returns (bool) {
        UserData memory user = usersByUsername[_username];
        if (bytes(user.username).length == 0) {
            return false; // User not found
        }
        
        return hashPassword(_password) == hashPassword(user.password);
    }

    
      // Mã hóa mật khẩu
    function hashPassword(string memory _password) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_password));
    }

      function getUserByUsername(string memory _username) public view returns (string memory, string memory,uint) {
        UserData memory user = usersByUsername[_username];
        return (user.username, "********", user.role); // Trả về mật khẩu dưới dạng dấu sao
    }

}
