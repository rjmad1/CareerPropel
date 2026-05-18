module.exports = {
  forbidden: [],
  options: {
    tsConfig: {
      fileName: 'tsconfig.json'
    },
    doNotFollow: {
      path: 'node_modules'
    },
    exclude: {
      path: [
        '\\.next',
        'node_modules'
      ]
    }
  }
};
