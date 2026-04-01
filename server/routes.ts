import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import multer from "multer";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

const localPythonPath =
  process.platform === "win32" && process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, "Programs", "Python", "Python313", "python.exe")
    : null;

const pythonCommands =
  process.env.PYTHON_BIN
    ? [process.env.PYTHON_BIN]
    : process.platform === "win32"
      ? [
          ...(localPythonPath && fs.existsSync(localPythonPath) ? [localPythonPath] : []),
          "python",
          "py -3",
          "python3",
        ]
      : ["python3", "python"];

const uploadDir = path.join(process.cwd(), "client/public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storageConfig = multer.diskStorage({
  destination: function (_req: any, _file: any, cb: (error: Error | null, destination: string) => void) {
    cb(null, uploadDir);
  },
  filename: function (_req: any, file: { originalname: string }, cb: (error: Error | null, filename: string) => void) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storageConfig });

type UploadedDetection = {
  disease: string;
  confidence: number;
  severity: string;
  treatment: {
    organic: string;
    chemical: string;
    prevention: string;
  };
};

async function runPythonScript(scriptPath: string, inputData: unknown): Promise<any> {
  let lastError: Error | undefined;

  for (const command of pythonCommands) {
    try {
      return await new Promise((resolve, reject) => {
        const [binary, ...binaryArgs] = command.split(" ");
        const pythonProcess = spawn(binary, [...binaryArgs, scriptPath]);

        let result = "";
        let error = "";
        let settled = false;

        pythonProcess.stdout.on("data", (data) => {
          result += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
          error += data.toString();
        });

        pythonProcess.on("error", (spawnError) => {
          if (settled) return;
          settled = true;
          reject(spawnError);
        });

        pythonProcess.on("close", (code) => {
          if (settled) return;
          settled = true;

          if (code !== 0) {
            reject(new Error(`Python script exited with code ${code}: ${error}`));
            return;
          }

          try {
            resolve(JSON.parse(result));
          } catch {
            reject(new Error(`Failed to parse Python output: ${result}`));
          }
        });

        pythonProcess.stdin.write(JSON.stringify(inputData));
        pythonProcess.stdin.end();
      });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw new Error(
    `Unable to run Python script. Tried: ${pythonCommands.join(", ")}. Last error: ${lastError?.message ?? "unknown error"}`,
  );
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.use("/uploads", (req, res, next) => {
    const filePath = path.join(uploadDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
      return;
    }
    next();
  });

  app.post(api.crop.predict.path, async (req, res) => {
    try {
      const input = api.crop.predict.input.parse(req.body);
      const userId = req.user?.claims?.sub ?? null;
      const scriptPath = path.join(process.cwd(), "server/ml/predict_crop.py");
      const mlResult = await runPythonScript(scriptPath, input);

      if (mlResult.error) throw new Error(mlResult.error);

      const saved = await storage.createCropPrediction({
        ...input,
        userId,
        predictedCrop: mlResult.prediction,
      });

      res.json(saved);
    } catch (error) {
      console.error("Crop prediction error:", error);
      res.status(500).json({ message: "Failed to predict crop" });
    }
  });

  app.get(api.crop.history.path, async (req, res) => {
    const history = await storage.getCropPredictions(req.user?.claims?.sub);
    res.json(history);
  });

  app.post(api.fertilizer.predict.path, async (req, res) => {
    try {
      const input = api.fertilizer.predict.input.parse(req.body);
      const userId = req.user?.claims?.sub ?? null;
      const scriptPath = path.join(process.cwd(), "server/ml/predict_fertilizer.py");
      const mlResult = await runPythonScript(scriptPath, input);

      if (mlResult.error) throw new Error(mlResult.error);

      const saved = await storage.createFertilizerRecommendation({
        ...input,
        userId,
        recommendedFertilizer: mlResult.recommendation,
      });

      res.json(saved);
    } catch (error) {
      console.error("Fertilizer prediction error:", error);
      res.status(500).json({ message: "Failed to recommend fertilizer" });
    }
  });

  app.get(api.fertilizer.history.path, async (req, res) => {
    const history = await storage.getFertilizerRecommendations(req.user?.claims?.sub);
    res.json(history);
  });

  app.post(api.disease.detect.path, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No image uploaded" });
        return;
      }

      const userId = req.user?.claims?.sub ?? null;
      const imageUrl = `/uploads/${req.file.filename}`;
      const mlResult = await runPythonScript(path.join(process.cwd(), "server/ml/detect_disease.py"), {
        imagePath: req.file.path,
      });

      if (mlResult.error) throw new Error(mlResult.error);

      const saved = await storage.createDiseaseDetection({
        userId,
        imageUrl,
        detectedDisease: mlResult.disease,
        confidence: mlResult.confidence,
      });

      res.json({
        ...saved,
        severity: mlResult.severity,
        treatment: mlResult.treatment,
      });
    } catch (error) {
      console.error("Disease detection error:", error);
      res.status(500).json({ message: "Failed to detect disease" });
    }
  });

  app.get(api.disease.history.path, async (req, res) => {
    const history = await storage.getDiseaseDetections(req.user?.claims?.sub);
    res.json(history);
  });

  app.post(api.irrigation.predict.path, async (req, res) => {
    try {
      const input = api.irrigation.predict.input.parse(req.body);
      const userId = req.user?.claims?.sub ?? null;
      const scriptPath = path.join(process.cwd(), "server/ml/predict_irrigation.py");
      const mlResult = await runPythonScript(scriptPath, input);

      if (mlResult.error) throw new Error(mlResult.error);

      await storage.createIrrigationLog({
        soilMoisture: input.soilMoisture,
        growthStage: input.growthStage,
        userId,
        evapotranspiration: mlResult.live_weather?.evapotranspiration ?? 0,
        temperature: mlResult.live_weather?.temp ?? input.temperature ?? 0,
        humidity: mlResult.live_weather?.humidity ?? input.humidity ?? 0,
        recommendedLiters: mlResult.recommended_liters,
        bestTime: mlResult.best_time,
        waterSavings: mlResult.water_savings_percentage,
      });

      res.json(mlResult);
    } catch (error) {
      console.error("Irrigation prediction error:", error);
      res.status(500).json({ message: "Failed to predict irrigation" });
    }
  });

  app.get(api.irrigation.history.path, async (req, res) => {
    const history = await storage.getIrrigationLogs(req.user?.claims?.sub);
    res.json(history);
  });

  return httpServer;
}
