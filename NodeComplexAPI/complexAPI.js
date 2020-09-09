exports.getHosts = async (req, res) => {
    try {
      let { sort_by, search_by, page, size, ssm } = req.query;
      sort_by = sort_by !== undefined && sort_by !== null ? sort_by.split(',') : [];
      ssm = ssm !== undefined && ssm !== null && ssm !== '' ? ssm : 'all';
  
      const all_hosts = await getHostsFromSSMServer_new(ssm);
  
      let new_all_hosts = all_hosts;
  
      if (search_by !== undefined && search_by !== null && search_by !== '') {
        new_all_hosts = matchSorter(all_hosts, search_by, {
          keys: host_keys,
          threshold: matchSorter.rankings.CONTAINS,
        });
      }
  
      // if (sort_by.length > 0) {
      //   const sort_key = [];
      //   const sort_order = [];
      //   for (let i = 0; i < sort_by.length; i++) {
      //     const tmp = sort_by[i].split('.');
      //     if (host_keys.includes(tmp[0])) {
      //       sort_key.push(tmp[0]);
      //       sort_order.push(tmp[1]);
      //     }
      //   }
      //   new_all_hosts = _.orderBy(new_all_hosts, sort_key, sort_order);
      // }
  
      if (sort_by.length > 0) {
        const sort_key = [];
        const sort_order = [];
        for (let i = 0; i < sort_by.length; i++) {
          const tmp = sort_by[i].split('.');
          if (host_keys.includes(tmp[0])) {
            sort_key.push(tmp[0]);
            sort_order.push(tmp[1]);
            console.log(tmp[0]);
            console.log(tmp[1]);
  
            if (tmp[0] === 'hostname') {
  
  
              var promise =
                new Promise(function (resolve, reject) {
                  var responseObj;
  
                  let sql = `SELECT * FROM hostLite ORDER BY
                    CAST(substr(trim(hostname),1,instr(trim(hostname),'.')-1) AS INTEGER),  
                    CAST(substr(substr(trim(hostname),length(substr(trim(hostname),1,instr(trim(hostname),'.')))+1,length(hostname)) ,1, instr(substr(trim(hostname),length(substr(trim(hostname),1,instr(trim(hostname),'.')))+1,length(hostname)),'.')-1) AS INTEGER), 
                    CAST(substr(substr(trim(hostname),length(substr(substr(trim(hostname),length(substr(trim(hostname),1,instr(trim(hostname),'.')))+1,length(hostname)) ,1, instr(substr(trim(hostname),length(substr(trim(hostname),1,instr(trim(hostname),'.')))+1,length(hostname)),'.')))+length(substr(trim(hostname),1,instr(trim(hostname),'.')))+1,length(hostname)) ,1, instr(substr(trim(hostname),length(substr(substr(trim(hostname),length(substr(trim(hostname),1,instr(trim(hostname),'.')))+1,length(hostname)) ,1, instr(substr(trim(hostname),length(substr(trim(hostname),1,instr(trim(hostname),'.')))+1,length(hostname)),'.')))+length(substr(trim(hostname),1,instr(trim(hostname),'.')))+1,length(hostname)),'.')-1) AS INTEGER), 
                    CAST(substr(trim(hostname),length(substr(substr(trim(hostname),length(substr(substr(trim(hostname),length(substr(trim(hostname),1,instr(trim(hostname),'.')))+1,length(hostname)) ,1, instr(substr(trim(hostname),length(substr(trim(hostname),1,instr(trim(hostname),'.')))+1,length(hostname)),'.')))+length(substr(trim(hostname),1,instr(trim(hostname),'.')))+1,length(hostname)) ,1, instr(substr(trim(hostname),length(substr(substr(trim(hostname),length(substr(trim(hostname),1,instr(trim(hostname),'.')))+1,length(hostname)) ,1, instr(substr(trim(hostname),length(substr(trim(hostname),1,instr(trim(hostname),'.')))+1,length(hostname)),'.')))+length(substr(trim(hostname),1,instr(trim(hostname),'.')))+1,length(hostname)),'.')))+ length(substr(trim(hostname),1,instr(trim(hostname),'.')))+length(substr(substr(trim(hostname),length(substr(trim(hostname),1,instr(trim(hostname),'.')))+1,length(hostname)) ,1, instr(substr(trim(hostname),length(substr(trim(hostname),1,instr(trim(hostname),'.')))+1,length(hostname)),'.')))+1,length(trim(hostname))) AS INTEGER),
                    CAST(substr(trim(hostname),length(substr(substr(trim(hostname),length(substr(substr(trim(hostname),length(substr(trim(hostname),1,instr(trim(hostname),'_')))+1,length(hostname)) ,1, instr(substr(trim(hostname),length(substr(trim(hostname),1,instr(trim(hostname),'_')))+1,length(hostname)),'_')))+length(substr(trim(hostname),1,instr(trim(hostname),'_')))+1,length(hostname)) ,1, instr(substr(trim(hostname),length(substr(substr(trim(hostname),length(substr(trim(hostname),1,instr(trim(hostname),'_')))+1,length(hostname)) ,1, instr(substr(trim(hostname),length(substr(trim(hostname),1,instr(trim(hostname),'_')))+1,length(hostname)),'_')))+length(substr(trim(hostname),1,instr(trim(hostname),'_')))+1,length(hostname)),'_')))+ length(substr(trim(hostname),1,instr(trim(hostname),'_')))+length(substr(substr(trim(hostname),length(substr(trim(hostname),1,instr(trim(hostname),'_')))+1,length(hostname)) ,1, instr(substr(trim(hostname),length(substr(trim(hostname),1,instr(trim(hostname),'_')))+1,length(hostname)),'_')))+1,length(trim(hostname))) AS VARCHAR);
                  `;
  
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
  
              const collectedHosts =
                await promise.then((value) => {
                  return value;
                }).catch((error) => {
                  console.log(error);
                })
  
              if (tmp[1] === 'asc') {
                new_all_hosts = collectedHosts;
              }
  
              if (tmp[1] === 'desc') {
                new_all_hosts = collectedHosts.reverse();
              }
  
            }
            else {
              new_all_hosts = _.orderBy(new_all_hosts, sort_key, sort_order);
            }
  
          }
        }
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
  