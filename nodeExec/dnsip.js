const dns = require('dns');

const domain = 'bogol.duckdns.org';

dns.resolve4(domain, (err, addresses) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log(`도메인 ${domain}의 IP 주소: ${addresses.join("\t")}`);
});
