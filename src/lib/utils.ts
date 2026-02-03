export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita acentos
    .trim()
    .replace(/\s+/g, '-')           // Espacios por guiones
    .replace(/[^\w-]+/g, '')        // Quita caracteres especiales
    .replace(/--+/g, '-');          // Quita guiones dobles
}