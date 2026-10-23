/** Уменьшает фотографии Cloudinary при выдаче; локальные файлы и data URL не меняет. */
export function galleryImageUrl(src: string, size: number): string {
  return src.replace(
    /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)/,
    `$1c_limit,w_${size},h_${size}/q_auto/f_auto/`,
  )
}
