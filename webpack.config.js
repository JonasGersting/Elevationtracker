const path = require('path');

module.exports = {
  entry: './services/firebaseService.js',
  output: {
    filename: 'firebase.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
};
