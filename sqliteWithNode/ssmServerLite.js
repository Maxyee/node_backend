const bcrypt = require('bcryptjs');
const CryptoJS = require('crypto-js');


const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./ssmServer.db', sqlite3.OPEN_READWRITE);

// Sqllite Database Query

//get all ssmServer
exports.getSSMServersLite = async (req, res, next) => {
  try {
    let sql = `SELECT * FROM ssmServerLite`;
    db.all(sql, (err, rows) => {
      if (err) {
        console.error(err.message);
      }
      // res.json({
      //   "message": "success",
      //   "data": rows
      // })
      res.json(rows)

    })
  }
  catch (error) {
    console.log(error);
  }
}

