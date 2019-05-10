export function toDateString(date) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  return [year, month.toString().padStart(2, '0'), day.toString().padStart(2, '0')].join('-');
}
