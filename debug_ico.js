const fs = require('fs');
const pngToIco = require('png-to-ico');

console.log('Starting conversion...');
pngToIco(['assets/icon_256.png'])
    .then(buf => {
        fs.writeFileSync('assets/icon.ico', buf);
        console.log('Success');
        fs.writeFileSync('result.txt', 'Success');
    })
    .catch(err => {
        console.error('Failure', err);
        fs.writeFileSync('result.txt', 'Error: ' + err.toString());
    });
