const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
    let identicalUsers = users.filter((u) => u.username === username);
    if (identicalUsers.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ 
    let validProfiles = users.filter((u) => u.username === username && u.password === password);
    if (validProfiles.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }

    if (authenticatedUser(username, password)) {
        let token = jwt.sign({ data: username }, 'access', { expiresIn: 60 * 30 });
        
        req.session.authorization = {
            accessToken: token, username: username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(280).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let mainReview = req.query.review;
    let reviewer = req.user.data;

    if (books[isbn]) {
        let selectedBook = books[isbn];
        selectedBook.reviews[reviewer] = mainReview;
        return res.status(200).json({message: "The review has been successfully added / updated"});
    } else {
        return res.status(404).json({message: "Selected book code missing"});
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let reviewer = req.user.data;

    if (books[isbn]) {
        let selectedBook = books[isbn];
        if (selectedBook.reviews[reviewer]) {
            delete selectedBook.reviews[reviewer];
            return res.status(200).json({message: "Review deleted successfully"});
        } else {
            return res.status(44).json({message: "Review not found for this user"});
        }
    } else {
        return res.status(404).json({message: "Book not found"});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;