import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

export function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
    expiresIn: "1h",
  });
}

export function verifyToken(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
