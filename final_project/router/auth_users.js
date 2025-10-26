const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to check if the username is valid
const isValid = (username)=>{ 
    let userswithsamename = users.filter((user)=>{
        return user.username === username
    });
    return userswithsamename.length > 0;
}

// Function to check if username and password match
const authenticatedUser = (username,password)=>{ 
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    return validusers.length > 0;
}

// Task 7: Login as a registered user
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({message: "Error logging in. Username and password are required."});
    }

    if (authenticatedUser(username, password)) {
        // Generate an access token
        let accessToken = jwt.sign({
            data: password // Storing password in JWT is not best practice, but fine for this lab
        }, 'fingerprint_customer', { expiresIn: 60 * 60 }); // Expires in 1 hour

        // Store token in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.query.review; // Review text from query parameter
    const username = req.session.authorization.username; // Get username from session

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!reviewText) {
        return res.status(400).json({ message: "Review text is required" });
    }

    // Check if the book has reviews, if not, initialize an empty object
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // Add or update the review for the current user
    books[isbn].reviews[username] = reviewText;

    return res.status(200).json({ 
        message: "Review successfully added/updated", 
        reviews: books[isbn].reviews 
    });
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username; // Get username from session

    if (!books[isbn]) {
        return res.status(444).json({ message: "Book not found" }); // Using 444 as an example, 404 is also fine
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found for this user" });
    }

    // Delete the review for the current user
    delete books[isbn].reviews[username];

    return res.status(200).json({ 
        message: "Review successfully deleted", 
        reviews: books[isbn].reviews 
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

