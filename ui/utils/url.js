import trim from 'lodash/trim';

export const buildPath = (...args) => args.reduce((memo, part) => {
  if (part === undefined || part === null) {
    return memo;
  }

  part = trim(part, '/');

  if (part === '') {
    return memo;
  }

  return `${memo}/${part}`;
}, '');
