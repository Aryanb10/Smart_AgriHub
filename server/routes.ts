import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

// Configure Multer for file uploads
const uploadDir = path.join(process.cwd(), "client/public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storageConfig = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storageConfig });

// Helper to run Python scripts
async function runPythonScript(scriptPath: string, inputData: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python3", [scriptPath]);
    
    let result = "";
    let error = "";

    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      error += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`Python script exited with code ${code}: ${error}`));
      }
      try {
        resolve(JSON.parse(result));
      } catch (e) {
        reject(new Error(`Failed to parse Python output: ${result}`));
      }
    });

    // Send input data to stdin
    pythonProcess.stdin.write(JSON.stringify(inputData));
    pythonProcess.stdin.end();
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Serve uploads statically (for when running in production/without vite proxying public correctly)
  // In dev, Vite serves public/, but explicit route helps debug
  app.use('/uploads', (req, res, next) => {
    // Basic static serve fallback
    const filePath = path.join(uploadDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      next();
    }
  });

  // --- CROP PREDICTION ---
  app.post(api.crop.predict.path, async (req, res) => {
    try {
      const input = api.crop.predict.input.parse(req.body);
      const userId = req.user?.claims?.sub;

      // Run Python ML model
      const scriptPath = path.join(process.cwd(), "server/ml/predict_crop.py");
      const mlResult = await runPythonScript(scriptPath, input);
      
      if (mlResult.error) throw new Error(mlResult.error);

      // Save to DB
      const saved = await storage.createCropPrediction({
        ...input,
        userId: userId || null,
        predictedCrop: mlResult.prediction
      });

      res.json(saved);
    } catch (error) {
      console.error("Crop prediction error:", error);
      res.status(500).json({ message: "Failed to predict crop" });
    }
  });

  app.get(api.crop.history.path, async (req, res) => {
    const userId = req.user?.claims?.sub;
    const history = await storage.getCropPredictions(userId);
    res.json(history);
  });

  // --- FERTILIZER RECOMMENDATION ---
  app.post(api.fertilizer.predict.path, async (req, res) => {
    try {
      const input = api.fertilizer.predict.input.parse(req.body);
      const userId = req.user?.claims?.sub;

      const scriptPath = path.join(process.cwd(), "server/ml/predict_fertilizer.py");
      const mlResult = await runPythonScript(scriptPath, input);

      if (mlResult.error) throw new Error(mlResult.error);

      const saved = await storage.createFertilizerRecommendation({
        ...input,
        userId: userId || null,
        recommendedFertilizer: mlResult.recommendation
      });

      res.json(saved);
    } catch (error) {
      console.error("Fertilizer prediction error:", error);
      res.status(500).json({ message: "Failed to recommend fertilizer" });
    }
  });

  app.get(api.fertilizer.history.path, async (req, res) => {
    const userId = req.user?.claims?.sub;
    const history = await storage.getFertilizerRecommendations(userId);
    res.json(history);
  });

  // --- DISEASE DETECTION ---
  app.post(api.disease.detect.path, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No image uploaded" });
      
      const userId = req.user?.claims?.sub;
      const imageUrl = `/uploads/${req.file.filename}`;
      const filePath = req.file.path;

      // Run Python script
      const scriptPath = path.join(process.cwd(), "server/ml/detect_disease.py");
      // Pass file path to script (script doesn't need stdin json in this mock, but we can pass args)
      // Modifying runPythonScript to handle args or just stdin? 
      // The current runPythonScript writes JSON to stdin. 
      // Let's modify the python script to read stdin or just ignore it if it hardcodes.
      // Or pass image path in JSON
      const mlResult = await runPythonScript(scriptPath, { imagePath: filePath });

      if (mlResult.error) throw new Error(mlResult.error);

      const saved = await storage.createDiseaseDetection({
        userId: userId || null,
        imageUrl: imageUrl,
        detectedDisease: mlResult.disease,
        confidence: mlResult.confidence
      });

      res.json(saved);
    } catch (error) {
      console.error("Disease detection error:", error);
      res.status(500).json({ message: "Failed to detect disease" });
    }
  });

  app.get(api.disease.history.path, async (req, res) => {
    const userId = req.user?.claims?.sub;
    const history = await storage.getDiseaseDetections(userId);
    res.json(history);
  });

  // --- SMART IRRIGATION ---
  app.post(api.irrigation.predict.path, async (req, res) => {
    try {
      const input = api.irrigation.predict.input.parse(req.body);
      const userId = req.user?.claims?.sub;

      const scriptPath = path.join(process.cwd(), "server/ml/predict_irrigation.py");
      const mlResult = await runPythonScript(scriptPath, input);

      if (mlResult.error) throw new Error(mlResult.error);

      // Save to logs
      await storage.createIrrigationLog({
        ...input,
        userId: userId || null,
        recommendedLiters: mlResult.recommended_liters,
        bestTime: mlResult.best_time,
        waterSavings: mlResult.water_savings_percentage
      });

      res.json(mlResult);
    } catch (error) {
      console.error("Irrigation prediction error:", error);
      res.status(500).json({ message: "Failed to predict irrigation" });
    }
  });

  app.get(api.irrigation.history.path, async (req, res) => {
    const userId = req.user?.claims?.sub;
    const history = await storage.getIrrigationLogs(userId);
    res.json(history);
  });

  return httpServer;
}
