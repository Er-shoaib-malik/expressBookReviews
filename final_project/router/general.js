const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username =  req.body.username;
    const password =   req.body.password;

    if (!username || !password) {
        return res.status(400).json({message: "Missing credentials"});
    }

    const exists = users.some(u => u.username === username);
    if (exists) {
        return res.status(409).json({message: "Username already exists"});
    }

    users.push({"username": username, "password": password});
    return res.status(200).json({message: "Registration successful"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    const getList =  new Promise((resolve) => {
        resolve(books);
    });

    getList.then((allBooks) => {
        res.status(200).send(JSON.stringify(allBooks, null, 4));
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbnVal =   req.params.isbn;

    const findByIsbn =  new Promise((resolve, reject) => {
        if (books[isbnVal]) {
            resolve(books[isbnVal]);
        } else {
            reject("Book not found");
        }
    });

    findByIsbn
        .then((data) => res.status(200).json(data))
        .catch((err) => res.status(404).json({message: err}));
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const authorVal =   req.params.author.toLowerCase();

    const findByAuthor =   new Promise((resolve) => {
        let matches =  {};
        for (let id in books) {
            if (books[id].author.toLowerCase() === authorVal) {
                matches[id] = books[id];
            }
        }
        resolve(matches);
    });

    findByAuthor.then((data) => {
        if (Object.keys(data).length === 0) {
            return res.status(404).json({message: "Author not found"});
        }
        res.status(200).json(data);
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const titleVal =  req.params.title.toLowerCase();

    const findByTitle =   new Promise((resolve) => {
        let results =  {};
        for (let key in books) {
            if (books[key].title.toLowerCase() === titleVal) {
                results[key] = books[key];
            }
        }
        resolve(results);
    });

    findByTitle.then((data) => {
        if (Object.keys(data).length === 0) {
            return res.status(404).json({message: "Title not found"});
        }
        res.status(200).json(data);
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbnParam =  req.params.isbn;
    const targets =   books[isbnParam];

    if (targets) {
        return res.status(200).json(targets.reviews);
    }
    return res.status(404).json({message: "No reviews found"});
});

module.exports.general = public_users;