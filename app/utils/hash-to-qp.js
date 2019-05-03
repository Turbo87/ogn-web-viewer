import window from 'ember-window-mock';

/**
 * Converts the GliderTracker-style hash params (`lst` and `tsk`) to
 * query parameters.
 */
export function hashToQueryParams() {
  let { hash, search } = window.location;
  if (hash[0] !== '#') return;

  let hashParams = new URLSearchParams(hash.substring(1));
  let searchParams = new URLSearchParams(search);

  if (hashParams.has('lst')) {
    let lst = hashParams.get('lst');
    searchParams.set('lst', lst);
    hashParams.delete('lst');
  }

  if (hashParams.has('tsk')) {
    let tsk = hashParams.get('tsk');
    searchParams.set('tsk', tsk);
    hashParams.delete('tsk');
  }

  let newHash = hashParams.toString();
  if (newHash) {
    newHash = `#${newHash}`;
  }

  let newSearch = searchParams.toString();
  if (newSearch) {
    newSearch = `?${newSearch}`;
  }

  window.location.search = newSearch;
  window.location.hash = newHash;
}
