var _ = require('lodash');
const matchSorter = require('match-sorter').default;

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./ssmServer.db', sqlite3.OPEN_READWRITE);



const host_keys = ['hostname', 'host_type', 'address', 'bios_version', 'bmc_version', 'baseboard_model', 'ssmServer'];

exports.getLiteHosts = async (req, res) => {
  try {

    let { sort_by, search_by, page, size, ssm } = req.query;
    sort_by = sort_by !== undefined && sort_by !== null ? sort_by.split(',') : [];
    ssm = ssm !== undefined && ssm !== null && ssm !== '' ? ssm : 'all';

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

    res.send(new_all_hosts);

  } catch (error) {
    console.log(error);
    res.send(error);
  }
}