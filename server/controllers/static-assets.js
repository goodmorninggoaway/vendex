module.exports = {
  serve: {
    handler: {
      directory: {
        path: '.',
        redirectToSlash: true,
        index: true,
      },
    },
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
  },
};
