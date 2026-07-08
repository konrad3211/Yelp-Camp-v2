// Przechowuje pliki tymczasowo w pamięci RAM.
// Dzięki temu możemy wysłać je bezpośrednio do Cloudinary
// bez zapisywania ich na dysku.
import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),
});
