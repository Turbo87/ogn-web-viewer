import fetch from 'fetch';

export default async function fetchText(url) {
  let response = await fetch(url);
  if (response.ok) {
    return response.text();
  }

  throw response;
}
