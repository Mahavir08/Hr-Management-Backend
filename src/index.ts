import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cpfRoutes from "./routes/cpf.routes";

const app = express();
const port = process.env.PORT || 8000;

// Security middleware
app.use(helmet());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// Routes
app.use("/api/cpf", cpfRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
