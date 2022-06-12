const DbSvc = require('../services/Db.js');
const UserSvc = require('../services/Users.js');
const AuthSvc = require('../services/Auth.js');

exports.authorize = (async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    
    const db = await DbSvc.connectToDB();
    const user = await UserSvc.getUserByUsername(db, username);
    const token = await AuthSvc.validateUser(db, username, password, user);
    db.end();

    if (!token) {
        res.status(404).json({
            auth: false,
        });
        return false;
    } else {
        res.status(200).json({
            auth: true,
            token: token,
            result: user
        });
        return true;
    }
})

exports.authenticate = (async function (req, res) {
    if(!req.userID) {
        res.status(404).send({
            auth: false,
        });
        return false;
    } else {
        res.status(200).send({
            auth: true,
            userID: req.userID,
        });
        return true;
    }
})