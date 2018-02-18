module.exports = {
  serve: {
    files: { relativeTo: __dirname },
    handler: {
      directory: {
        path: '../../static',
        redirectToSlash: true,
        index: true,
      },
    },
    auth: false,
  },
  react: {
    files: { relativeTo: __dirname },
    handler: {
      directory: {
        path: '../../ui/dist/',
        listing: false,
        index: false,
        defaultExtension: 'js',
      },
    },
    auth: false,
  },
};
