export const validate = (schema) => {
  return (req, res, next) => {
    //safeParse zwraca success true, lub false, nie trzeba uzywac dlatego try/catch
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        //urposzczone wysyalenie error; flatten i field errors
        errors: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
};
