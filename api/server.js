import { default as app } from "./index.js";

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use`);
    } else {
      console.error("Error starting server:", error);
    }
    process.exit(1);
  }
};

startServer();
