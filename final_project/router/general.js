const express = require('express');
const router = express.Router();
const booksDB = require('./booksdb.js');
const { users, isValid } = require('./auth_users.js');
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password cannot be empty.' });
    }
    if (isValid(username)) {
        return res.status(409).json({ message: 'User already exists, please choose another username.' });
    }
    users.push({ username, password });
    return res.status(201).json({ message: 'User registered successfully. You may now login.' });
});
router.get('/', (req, res) => {
    const fetchBooks = new Promise((resolve, reject) => {
        if (booksDB && Object.keys(booksDB).length > 0) {
            resolve(booksDB);
        } else {
            reject('No books available.');
        }
    });
    fetchBooks.then(data => res.status(200).json(data), err => res.status(404).json({ message: err }));
});
router.get('/isbn/:isbn', (req, res) => {
    const { isbn } = req.params;
    const fetchBook = new Promise((resolve, reject) => {
        const book = booksDB[isbn];
        if (book) {
            resolve(book);
        } else {
            reject('Book not found with the provided ISBN.');
        }
    });
    fetchBook.then(book => res.status(200).json(book), error => res.status(404).json({ message: error }));
});
router.get('/author/:author', async (req, res) => {
    const { author } = req.params;
    try {
        const result = await new Promise((resolve, reject) => {
            const matchedBooks = Object.values(booksDB).filter(b => b.author === author);
            if (matchedBooks.length > 0) {
                resolve(matchedBooks);
            } else {
                reject('No books found for this author.');
            }
        });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});
router.get('/title/:title', async (req, res) => {
    const { title } = req.params;
    try {
        const result = await new Promise((resolve, reject) => {
            const matchedBooks = Object.values(booksDB).filter(b =>
                b.title.toLowerCase().includes(title.toLowerCase())
            );
            if (matchedBooks.length > 0) {
                resolve(matchedBooks);
            } else {
                reject('No books found matching the title.');
            }
        });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});
router.get('/review/:isbn', (req, res) => {
    const { isbn } = req.params;
    const book = booksDB[isbn];
    if (!book) {
        return res.status(404).json({ message: 'Book not found.' });
    }
    if (book.reviews && Object.keys(book.reviews).length > 0) {
        return res.status(200).json(book.reviews);
    }
    return res.status(200).json({ message: 'No reviews available for this book yet.' });
});
module.exports.general = router;
