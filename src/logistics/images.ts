export const getIconURL = (objectName: string, size: 64 | 256): string => {
  const base = `https://github.com/greeny/SatisfactoryTools/blob/master/www/assets/images/items/`
  return `${base}${objectName.replace(/_/g, '-')}_${size}.png?raw=true`
}
