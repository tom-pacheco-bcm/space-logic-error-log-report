
// getParentPath returns one path level higher
export function getParentPath(path: string) {
  // get parent of string path
  const end = path.lastIndexOf("/");
  if (end === -1) {
    return path;
  }
  return path.substring(0, end)
}
