export default function parseQuery() {
  let { search } = window.location;
  if (search.startsWith('?')) {
    search = search.replace('?', '');
  }

  return search.split('&').reduce((memo, pair) => {
    const [key, value] = pair.split('=');
    memo[decodeURI(key)] = decodeURI(value);
    return memo;
  }, {});
}
