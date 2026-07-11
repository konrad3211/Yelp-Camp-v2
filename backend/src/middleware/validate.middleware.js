export const validate = (schema) => {
  return (req, res, next) => {
    //safeParse - bierze dane z req.body,sprawdza je według przekazanej schemy Zoda, wykonuje transformacje zapisane w schemie, np. .trim(), .toLowerCase() albo z.coerce.number().
    //Jak jest true to zwraca result.success = true i result.data a jak jest result.success = false to nie ma result.data tylko result.error
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        //urposzczone wysyalenie error; flatten i field errors
        errors: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
};
