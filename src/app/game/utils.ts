
export function bhash(str: string) {
  let hash = 0;
  let chr;
  if (str.length === 0) {
    return hash;
  }
  // tslint:disable-next-line:one-variable-per-declaration
  for (let i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash < 0 ? -hash : hash;
}
