import supabase from "../lib/supabase.js";
import { User } from "./lib/models.js";

export const getUser = async (req, res) => {
  try {
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers();
    if (error) throw error;

    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email,
      role: user.user_metadata?.role || "customer",
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log("req.body", req.body);
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.json({ token: generateToken(user) });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
