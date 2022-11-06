const mimetypes = [
  "image/webp",
  "image/png",
  "audio/wav",
  "audio/mp3",
  "audio/mpeg",
]

const isValidMimetype = (mimetype) => {
  for (const mt of mimetypes) {
    if (mt === mimetype) {
      return true;
    }
  }
  return false;
}

export default isValidMimetype;