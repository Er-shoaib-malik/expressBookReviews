const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

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

// Task 10: Get the book list available in the shop using a Promise callback
public_users.get('/', function (req, res) {
    const fetchBooks = new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject("Data unavailable");
        }
    });

    fetchBooks
        .then((bookList) => res.status(200).send(JSON.stringify(bookList, null, 4)))
        .catch((err) => res.status(500).json({message: err}));
});

// Task 11: Get book details based on ISBN using Async-Await
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbnVal = req.params.isbn;

    try {
        const bookDetails = await new Promise((resolve, reject) => {
            if (books[isbnVal]) {
                resolve(books[isbnVal]);
            } else {
                reject("Book not found");
            }
        });
        return res.status(200).json(bookDetails);
    } catch (err) {
        return res.status(404).json({message: err});
    }
});
  
// Task 12: Get book details based on author using Axios / Promise logic
public_users.get('/author/:author', function (req, res) {
    const authorVal = req.params.author.toLowerCase();

    const filterByAuthor = new Promise((resolve) => {
        let matches = {};
        for (let id in books) {
            if (books[id].author.toLowerCase() === authorVal) {
                matches[id] = books[id];
            }
        }
        resolve(matches);
    });

    filterByAuthor.then((data) => {
        if (Object.keys(data).length === 0) {
            return res.status(404).json({message: "Author not found"});
        }
        res.status(200).json(data);
    });
});

// Task 13: Get all books based on title using Async-Await with explicit tracking
public_users.get('/title/:title', async function (req, res) {
    const titleVal = req.params.title.toLowerCase();

    try {
        const results = await new Promise((resolve) => {
            let matches = {};
            for (let key in books) {
                if (books[key].title.toLowerCase() === titleVal) {
                    matches[key] = books[key];
                }
            }
            resolve(matches);
        });

        if (Object.keys(results).length === 0) {
            return res.status(404).json({message: "Title not found"});
        }
        return res.status(200).json(results);
    } catch (error) {
        return res.status(500).json({message: "Search process failed"});
    }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbnParam = req.params.isbn;
    const targets = books[isbnParam];

    if (targets) {
        return res.status(200).json(targets.reviews);
    }
    return res.status(404).json({message: "No reviews found"});
});

module.exports.general = public_users;
