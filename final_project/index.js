const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Setup session middleware for routes starting with /customer
app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }))

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if the user's session and authorization data exist
    if (req.session && req.session.authorization) {
        
        // Retrieve the access token from the session
        let token = req.session.authorization['accessToken'];
        
        // Verify the token using the secret key "fingerprint_customer"
        jwt.verify(token, "fingerprint_customer", (err, user) => {
            if (!err) {
                // If verification is successful, attach the user's info to the request
                req.user = user;
                // Proceed to the next middleware or the requested route
                next();
            } else {
                // If the token is invalid or expired
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        // If no session or authorization data is found (user not logged in)
        return res.status(403).json({ message: "User not logged in" });
    }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running on port " + PORT));