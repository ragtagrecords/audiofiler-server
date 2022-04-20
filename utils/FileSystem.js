const fs = require('fs');
const Logger = require('./Logger.js');

function hasAccess(res, path, mode) {
    fs.access(
        path,
        mode, 
        (err) => {
            if (err) {
                Logger.logError('hasAccess', err.message);
                res.status(404).send({
                    message: "File not found or isn't accessible"
                });
                return false;
            }  
            return true;
      });
}

module.exports = { hasAccess };