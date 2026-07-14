import { Router, type IRouter } from "express";
import { authenticate } from "../middlewares/auth";

const router: IRouter = Router();

// Breed data for simulation
const BREEDS = [
  "Boerboel",
  "Rhodesian Ridgeback",
  "German Shepherd",
  "Labrador Retriever",
  "Rottweiler",
  "Jack Russell Terrier",
  "Bull Terrier",
  "English Springer Spaniel",
  "Border Collie",
  "Great Dane"
];

// POST /ai/identify-breed
router.post("/ai/identify-breed", authenticate, async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: "Image data is required" });
  }

  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

  // For simulation, we'll pick a few random breeds
  const shuffled = BREEDS.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);

  let totalConfidence = 0;
  const predictions = selected.map((breed, index) => {
    // Decreasing confidence for lower ranks
    const base = index === 0 ? 0.7 : index === 1 ? 0.15 : 0.05;
    const confidence = base + (Math.random() * 0.1);
    totalConfidence += confidence;
    return { breed, confidence: parseFloat(confidence.toFixed(4)) };
  });

  // Normalize confidence to 1
  const normalized = predictions.map(p => ({
    ...p,
    confidence: parseFloat((p.confidence / totalConfidence).toFixed(4))
  }));

  res.json({ predictions: normalized });
});

export default router;
