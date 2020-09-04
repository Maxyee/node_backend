var _ = require('lodash');
const Host = require('../models/HostModel');
const { Client } = require('pg');
const CryptoJS = require('crypto-js');

const SSMServer = require('../models/SSMServerModel');
const { off } = require('../models/HostModel');

const matchSorter = require('match-sorter').default;

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./ssmServer.db', sqlite3.OPEN_READWRITE);


const SQL =
  'select ssm_hosts.host_object_id as hostOID, ssm_hosts.host_name as hostName, ssm_tl_hosttype.type_value as host_type, ssm_hosts.address as address, systeminfo_bios.ver as bios_version, systeminfo_ipmi.me_fw_version as bmc_version, systeminfo_baseboard.model as baseboard_model from ssm_hosts left outer join systeminfo_bios on ssm_hosts.host_object_id = systeminfo_bios.host_object_id left outer join systeminfo_baseboard on ssm_hosts.host_object_id = systeminfo_baseboard.host_object_id left outer join systeminfo_ipmi on ssm_hosts.host_object_id = systeminfo_ipmi.host_object_id left outer join ssm_tl_hosttype on ssm_hosts.instance_id = ssm_tl_hosttype.hosttype_id inner join ssm_objects on ssm_hosts.host_object_id = ssm_objects.object_id where ssm_objects.is_active = 1';

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

// async function getHostsFromSSMServer_new(ssmServer) {
//   const hosts = [];
//   let options = {};

//   if (ssmServer !== 'all') {
//     options = { IPAddress: ssmServer };
//   }

//   const servers = await SSMServer.find(options)

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
//   console.log('ssm value in host file' + ssm);

//   var promise =
//     new Promise(function (resolve, reject) {
//       var responseObj;

//       let sql = `SELECT * FROM ssmServerLite WHERE IPAddress = '${ssm}'`;

//       if (ssm === 'all') {
//         sql = `SELECT * FROM ssmServerLite`;
//       }

//       db.all(sql, function cb(err, rows) {
//         if (err) {
//           responseObj = {
//             'error': err
//           };
//           reject(responseObj);
//         } else {
//           console.log(rows);
//           responseObj = rows;
//           resolve(responseObj);
//         }

//       });
//     });

//   let servers =
//     await promise.then((value) => {
//       return value;
//     }).catch((error) => {
//       console.log(error);
//     })

//   //console.log(servers);

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

//   //inserting updated all host data..
//   let clearTable = `DROP TABLE hostLite`;
//   let createNewTable = `
//         CREATE TABLE IF NOT EXISTS hostLite (
//           hostlite_id INTEGER PRIMARY KEY,
//           hostoid INTEGER,
//           hostname TEXT,
//           host_type TEXT,
//           address TEXT,
//           bios_version TEXT,
//           bmc_version TEXT,
//           baseboard_model TEXT,
//           ssmServer TEXT
//         )`;

//   let sqlLiteHost = `INSERT INTO hostLite(hostoid, hostname, host_type, address, bios_version, bmc_version, baseboard_model, ssmServer ) values(?,?,?,?,?,?,?,?)`;

//   db.serialize(() => {
//     db.run(clearTable)
//       .run(createNewTable)
//     hosts.map(p =>
//       db.run(sqlLiteHost, [p.hostoid, p.hostname, p.host_type, p.address, p.bios_version, p.bmc_version, p.baseboard_model, p.ssmServer], (err) => {
//         if (err) {
//           console.log(err.message);
//         }
//         else {
//           console.log('selected new host list added to the sqlite database')
//         }
//       })

//     )
//   })

//   return hosts;
// }

const host_keys = ['hostname', 'host_type', 'address', 'bios_version', 'bmc_version', 'baseboard_model', 'ssmServer'];


/* 
curl --request GET 'localhost:4444/hosts?search_by=31&page=1&size=10&sort_by=hostname.desc,ssmServer.asc&ssm=172.31.2.26'
*/

exports.getHosts = async (req, res) => {
  try {
    let { sort_by, search_by, page, size, ssm } = req.query;
    sort_by = sort_by !== undefined && sort_by !== null ? sort_by.split(',') : [];
    ssm = ssm !== undefined && ssm !== null && ssm !== '' ? ssm : 'all';

    // let update the all host data before show
    //const updated_hosts = await getHostsFromSSMServer_new(ssm = 'all');
    // console.log('console value for getHosts')
    var promise =
      new Promise(function (resolve, reject) {
        var responseObj;

        let sql = `SELECT * FROM hostLite WHERE ssmServer = '${ssm}'`;

        if (ssm === 'all') {
          sql = `SELECT * FROM hostLite`;
        }

        db.all(sql, function cb(err, rows) {
          if (err) {
            responseObj = {
              'error': err
            };
            reject(responseObj);
          } else {

            responseObj = rows;
            resolve(responseObj);
          }

        });
      });


    let all_hosts =
      await promise.then((value) => {
        return value;
      }).catch((error) => {
        console.log(error);
      })
    // console.log(all_hosts);

    let new_all_hosts = all_hosts;

    if (search_by !== undefined && search_by !== null && search_by !== '') {
      new_all_hosts = matchSorter(all_hosts, search_by, {
        keys: host_keys,
        threshold: matchSorter.rankings.CONTAINS,
      });
    }

    if (sort_by.length > 0) {
      const sort_key = [];
      const sort_order = [];
      for (let i = 0; i < sort_by.length; i++) {
        const tmp = sort_by[i].split('.');
        if (host_keys.includes(tmp[0])) {
          sort_key.push(tmp[0]);
          sort_order.push(tmp[1]);
        }
      }
      new_all_hosts = _.orderBy(new_all_hosts, sort_key, sort_order);
    }

    if (page !== undefined && page !== null && !isNaN(page) && page > 0) {
      const pageSize = size !== undefined && size !== null && !isNaN(size) && parseInt(size) > 0 ? parseInt(size) : 20;
      const start = (page - 1) * pageSize;
      new_all_hosts = start <= new_all_hosts.length ? new_all_hosts.splice(start, pageSize) : [];
    }

    res.send(new_all_hosts)
  } catch (error) {
    console.log(error);
    res.send(error)
  }
}
