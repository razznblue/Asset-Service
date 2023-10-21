// MimeType Whitelist
const mimetypes = [
  "image/webp",
  "image/png",
  "image/jpg",
  "image/jpeg",
  "audio/wav",
  "audio/mp3",
  "audio/mpeg",
  "application/json",
  "application/xml",
  "application/text",
  "application/pdf"
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