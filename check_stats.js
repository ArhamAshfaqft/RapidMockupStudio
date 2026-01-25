const fs = require('fs');
try {
    const stats = fs.statSync('assets/icon.png');
    console.log(`Size: ${stats.size} bytes`);
} catch (e) {
    console.error(e);
}
