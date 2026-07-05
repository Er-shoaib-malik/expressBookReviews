const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const authenticatedRoutes = require('./router/auth_users.js').authenticated;
const publicRoutes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Set up tracking session for users under /customer routes
app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Security gatekeeper for authenticated user requests
app.use("/customer/auth/*", function auth(req, res, next) {
    
    // Check if user session has a valid authorization profile stored
    if (req.session && req.session.authorization) {
        const userToken = req.session.authorization['accessToken'];

        // Validate token integrity against the cryptographic key
        jwt.verify(userToken, "access", (tokenError, decodedProfile) => {
            if (tokenError) {
                return res.status(403).json({ alert: "Session credentials expired or invalid." });
            }
            
            // Expose the profile details to inner route layers
            req.user = decodedProfile;
            next();
        });
    } else {
        return res.status(403).json({ alert: "Access barred. Active login session required." });
    }
});
 
const PORT = 5000;

app.use("/customer", authenticatedRoutes);
app.use("/", publicRoutes);

app.listen(PORT, () => console.log(`Server listening engine activated on port ${PORT}`));