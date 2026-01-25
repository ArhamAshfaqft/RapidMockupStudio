const pkg = require('image-size');
console.log('Type of export:', typeof pkg);
console.log('Keys:', Object.keys(pkg));
if (typeof pkg === 'function') console.log('Export is a function');
try {
    // Try default usage
    const dim = pkg('assets/icon.png');
    console.log('Direct call success:', dim);
} catch (e) { console.log('Direct call failed'); }

try {
    // Try imageSize property
    const dim = pkg.imageSize('assets/icon.png');
    console.log('Property call success:', dim);
} catch (e) { console.log('Property call failed'); }
