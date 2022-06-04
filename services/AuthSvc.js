const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Logger = require('../utils/Logger.js');

function hashPassword(password){
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    let hashSalt = {
        salt: salt,
        hash: hash,
    };
    return hashSalt;
}

function validatePassword(password, user){
    if(!password || !user || !user.salt || !user.hashedPassword) {
        return false;
    }
    const hashedPassword = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
    return hashedPassword === user.hashedPassword ? user : false;
}

async function validateUser(db, username, password, user){
    const validUser = validatePassword(password, user);

    if (!validUser) {
        Logger.logError('validateUser()', username + ' failed to log in');
        return false;
    }

    const userID = user.id;
    const token = jwt.sign(
        {userID},
        process.env.JWT_SECRET, 
        {
            expiresIn: '7d',
        }
    );     

    if (token) {
        Logger.logSuccess('validateUser()', username + ' logged in');
        return token;
    } else {
        Logger.logError('validateUser()', username + ' failed to log in');
        return false;
    }
}

const verifyJWT = (req, res, next) => {
    const token = req.headers["x-access-token"];

    if (!token) {
        res.status(404).send({
            message: "Access token not even found",
        });
    } else {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                res.status(404).send({
                    message: "Nice try, access token wasn't even legit"
                });
            } else {
                req.userID = decoded.userID;
                next();
            }
        })
    }




}

module.exports = { hashPassword, validateUser, verifyJWT };
