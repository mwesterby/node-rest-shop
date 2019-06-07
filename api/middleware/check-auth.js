const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; // use split to remove 'Bearer ' from the start of the token. Then access the token at position 1.
        console.log(token);
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decoded; // can be used to extract the encoded user data
        next(); // have to call next if we did successfully authenticate 
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
};