var _ = require('lodash');
const bcrypt = require('bcryptjs');

const { Client } = require('pg');
const CryptoJS = require('crypto-js');

const SSMServer = require('../models/SSMServerModel');

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./ssmServer.db', sqlite3.OPEN_READWRITE);


// finding latest hosts
const SQL =
  'select ssm_hosts.host_object_id as hostOID, ssm_hosts.host_name as hostName, ssm_tl_hosttype.type_value as host_type, ssm_hosts.address as address, systeminfo_bios.ver as bios_version, systeminfo_ipmi.me_fw_version as bmc_version, systeminfo_baseboard.model as baseboard_model from ssm_hosts left outer join systeminfo_bios on ssm_hosts.host_object_id = systeminfo_bios.host_object_id left outer join systeminfo_baseboard on ssm_hosts.host_object_id = systeminfo_baseboard.host_object_id left outer join systeminfo_ipmi on ssm_hosts.host_object_id = systeminfo_ipmi.host_object_id left outer join ssm_tl_hosttype on ssm_hosts.instance_id = ssm_tl_hosttype.hosttype_id inner join ssm_objects on ssm_hosts.host_object_id = ssm_objects.object_id where ssm_objects.is_active = 1';


// async function getHostsFromSSMServer_new(ssmServer) {
//   const hosts = [];
//   let options = {};

//   if (ssmServer !== 'all') {
//     options = { IPAddress: ssmServer };
//   }

//   const servers = await SSMServer.find(options)

//   // getting servers fom sqlite local db

//   for (let i = 0; i < servers.length; i++) {
//     const server = servers[i];
//     const decryptedByte = CryptoJS.AES.decrypt(server.password, process.env.AES_SECRET);
//     const decryptedPassword = decryptedByte.toString(CryptoJS.enc.Utf8);
//     const _authobj = {
//       address: server.IPAddress,
//       username: server.username,
//       password: decryptedPassword
//     }
//     const _hosts = await getHostsFromSSMServer(_authobj);
//     _hosts.forEach(host => {
//       host.ssmServer = server.IPAddress;
//       hosts.push(host);
//     });
//   }
//   return hosts;
// }

// async function getHostsFromSSMServer_new(ssmServer) {
//   const hosts = [];
//   let ssm = ssmServer;
//   console.log('ssm value in server file' + ssm);

//   let sql = `SELECT * FROM ssmServerLite WHERE IPAddress = '${ssm}'`;

//   if (ssm === 'all') {
//     //console.log('calling for all')
//     sql = `SELECT * FROM ssmServerLite`;
//   }

//   db.all(sql, function (err, rows) {
//     if (err) {
//       console.log(err.message)
//     }
//     else {
//       console.log(rows);
//     }
//   })

//   let servers = [];
//   console.log(servers);

//   for (let i = 0; i < servers.length; i++) {
//     const server = servers[i];
//     const decryptedByte = CryptoJS.AES.decrypt(server.password, process.env.AES_SECRET);
//     const decryptedPassword = decryptedByte.toString(CryptoJS.enc.Utf8);
//     const _authobj = {
//       address: server.IPAddress,
//       username: server.username,
//       password: decryptedPassword
//     }
//     const _hosts = await getHostsFromSSMServer(_authobj);
//     _hosts.forEach(host => {
//       host.ssmServer = server.IPAddress;
//       hosts.push(host);
//     });
//   }
//   return hosts;
// }



async function getHostsFromSSMServer(auth) {
  const client = new Client({
    host: auth.address,//'172.31.2.26',//'10.12.18.1', //auth.address,
    port: 9002, // (hardcoded)
    database: 'ssm', // (hardcoded)
    user: auth.username, //'postgres',//auth.username,
    password: auth.password, //'postgres',//auth.password,
  });

  try {
    await client.connect();
    const { rows } = await client.query(SQL);
    return rows;

  } catch (ex) {
    console.log(`Something wrong happend ${ex}`);
    return [];
  } finally {
    await client.end()
  }
}


exports.getSSMServer = async (req, res, next) => {
  try {
    //const servers = await SSMServer.find();

    // getting all the ssmServer from sqlite database
    let sql = `SELECT * FROM ssmServerLite`;
    db.all(sql, (err, rows) => {
      if (err) {
        console.error(err.message);
      }
      res.json(rows)
    })

    //res.json(servers);
  } catch (error) {
    console.log(error);
  }
};

exports.addSSMServer = async (req, res, next) => {
  try {
    const { IPAddress, Port, username, password } = req.body;

    const aesEncryptedPassword = CryptoJS.AES.encrypt(password, process.env.AES_SECRET).toString();

    const newSSMServer = {
      IPAddress,
      Port,
      username,
      password: aesEncryptedPassword
    }


    let execution = true;
    if (IPAddress && Port && username && password !== null) {
      //var data = newSSMServer;
      //var id = data._id;
      var Ip = IPAddress;
      var port = Port;
      var user = username;
      var pass = aesEncryptedPassword;
      //var version = data.__v;
      // lets create the table if exists
      let createSql = `
        CREATE TABLE IF NOT EXISTS ssmServerLite (
          ssm_id INTEGER PRIMARY KEY,
          IPAddress TEXT,
          Port TEXT,
          username TEXT,
          password TEXT
      )`;

      let sql = `INSERT INTO ssmServerLite(IPAddress, Port, username, password) values(?,?,?,?)`;
      db.serialize(() => {
        db.run(createSql)
          .run(sql, [Ip, port, user, pass], (err) => {
            if (err) {
              console.log(err.message)
            }
            else {
              console.log("Insert successful to sql database")
            }
          })
      })
    }
    // ---------------------------------------
    console.log(execution)
    // //transfering all host to local sqlite database..
    if (execution) {
      // let ssm = 'all'
      // const all_hosts = await getHostsFromSSMServer_new(ssm);
      // console.log(all_hosts.length);
      const hosts = [];
      const _authobj = {
        address: IPAddress,
        username: username,
        password: password
      }

      const _hosts = await getHostsFromSSMServer(_authobj);
      _hosts.forEach(host => {
        host.ssmServer = IPAddress;
        hosts.push(host);
      });

      //let clearTable = `DROP TABLE hostLite`;
      let createNewTable = `
    CREATE TABLE IF NOT EXISTS hostLite (
      hostlite_id INTEGER PRIMARY KEY,
      hostoid INTEGER,
      hostname TEXT,
      host_type TEXT,
      address TEXT,
      bios_version TEXT,
      bmc_version TEXT,
      baseboard_model TEXT,
      ssmServer TEXT
    )`;

      let sqlLiteHost = `INSERT INTO hostLite(hostoid, hostname, host_type, address, bios_version, bmc_version, baseboard_model, ssmServer ) values(?,?,?,?,?,?,?,?)`;

      db.serialize(() => {
        db.run(createNewTable)
        hosts.map(p =>
          db.run(sqlLiteHost, [p.hostoid, p.hostname, p.host_type, p.address, p.bios_version, p.bmc_version, p.baseboard_model, p.ssmServer], (err) => {
            if (err) {
              console.log(err.message);
            }
            else {
              console.log('selected new host list added to the sqlite database')
            }
          })

        )
      })
    }
    //-----------------------------------------------
    res.json(newSSMServer);
  } catch (error) {
    console.log(error);
  }
};


exports.removeSSMServer = async (req, res, next) => {
  try {
    const ssmServerId = req.params.ssmServerId;
    const ssmServerIp = req.params.ssmServerIp;
    console.log(ssmServerId);
    console.log(ssmServerIp);

    //await SSMServer.findByIdAndDelete({ _id: ssmServerId });

    // Deleting ssmServer from local Sqlite3 database
    if (ssmServerId && ssmServerIp !== null) {
      let clearSsmServerSql = `DELETE FROM ssmServerLite WHERE ssm_id = '${ssmServerId}'`;
      let clearHostDataSql = `DELETE FROM hostLite WHERE ssmServer = '${ssmServerIp}'`;

      db.serialize(() => {
        db.run(clearSsmServerSql)
          .run(clearHostDataSql, (err) => {
            if (err) {
              console.log(err.message);
            }
            else {
              console.log('ssmServer and its related host deleted from sqlite database')
            }
          })
      })
    }

    res.status(200).json({ message: 'Deleted Successfully' });
  } catch (error) {
    console.log(error);
  }
};
