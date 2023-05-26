import jwt from "jsonwebtoken";
// import dotenv from "dotenv";

export default (req, res, next) => {
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");
  // dotenv.config({ path: "./.env" });

  if (token) {
    try {
      const decoded = jwt.verify(token, "lolkekcheburek283598203958205982");

      req.userId = decoded._id;
      next();
    } catch (err) {
      return res.status(403).json({
        message: "Нет доступа",
      });
    }
  } else {
    return res.status(403).json({
      message: "Нет доступа",
    });
  }
};
