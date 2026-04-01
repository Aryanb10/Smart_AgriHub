import { 
  cropPredictions, fertilizerRecommendations, diseaseDetections, irrigationLogs,
  type CropPrediction, type InsertCropPrediction,
  type FertilizerRecommendation, type InsertFertilizerRecommendation,
  type DiseaseDetection, type InsertDiseaseDetection
} from "@shared/schema";
import type { User, UpsertUser as InsertUser } from "@shared/models/auth";
import { db, hasDatabase } from "./db";
import { eq, desc } from "drizzle-orm";
import { authStorage } from "./replit_integrations/auth/storage";

export interface IStorage {
  // Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: InsertUser): Promise<User>;

  // Crop
  createCropPrediction(data: InsertCropPrediction): Promise<CropPrediction>;
  getCropPredictions(userId?: string): Promise<CropPrediction[]>;

  // Fertilizer
  createFertilizerRecommendation(data: InsertFertilizerRecommendation): Promise<FertilizerRecommendation>;
  getFertilizerRecommendations(userId?: string): Promise<FertilizerRecommendation[]>;

  // Disease
  createDiseaseDetection(data: InsertDiseaseDetection): Promise<DiseaseDetection>;
  getDiseaseDetections(userId?: string): Promise<DiseaseDetection[]>;

  // Irrigation
  createIrrigationLog(data: any): Promise<any>;
  getIrrigationLogs(userId?: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // Auth delegates to the integration storage
  async getUser(id: string): Promise<User | undefined> {
    return authStorage.getUser(id);
  }
  async upsertUser(user: InsertUser): Promise<User> {
    return authStorage.upsertUser(user);
  }

  // Crop
  async createCropPrediction(data: InsertCropPrediction): Promise<CropPrediction> {
    const database = db!;
    const [result] = await database.insert(cropPredictions).values(data).returning();
    return result;
  }
  async getCropPredictions(userId?: string): Promise<CropPrediction[]> {
    if (!userId) return []; // Or return all if admin? For now, user specific
    const database = db!;
    return database.select()
      .from(cropPredictions)
      .where(eq(cropPredictions.userId, userId))
      .orderBy(desc(cropPredictions.createdAt));
  }

  // Fertilizer
  async createFertilizerRecommendation(data: InsertFertilizerRecommendation): Promise<FertilizerRecommendation> {
    const database = db!;
    const [result] = await database.insert(fertilizerRecommendations).values(data).returning();
    return result;
  }
  async getFertilizerRecommendations(userId?: string): Promise<FertilizerRecommendation[]> {
    if (!userId) return [];
    const database = db!;
    return database.select()
      .from(fertilizerRecommendations)
      .where(eq(fertilizerRecommendations.userId, userId))
      .orderBy(desc(fertilizerRecommendations.createdAt));
  }

  // Disease
  async createDiseaseDetection(data: InsertDiseaseDetection): Promise<DiseaseDetection> {
    const database = db!;
    const [result] = await database.insert(diseaseDetections).values(data).returning();
    return result;
  }
  async getDiseaseDetections(userId?: string): Promise<DiseaseDetection[]> {
    if (!userId) return [];
    const database = db!;
    return database.select()
      .from(diseaseDetections)
      .where(eq(diseaseDetections.userId, userId))
      .orderBy(desc(diseaseDetections.createdAt));
  }

  // Irrigation
  async createIrrigationLog(data: any): Promise<any> {
    const database = db!;
    const [result] = await database.insert(irrigationLogs).values(data).returning();
    return result;
  }
  async getIrrigationLogs(userId?: string): Promise<any[]> {
    if (!userId) return [];
    const database = db!;
    return database.select()
      .from(irrigationLogs)
      .where(eq(irrigationLogs.userId, userId))
      .orderBy(desc(irrigationLogs.createdAt));
  }
}

class MemoryStorage implements IStorage {
  private cropPredictions: CropPrediction[] = [];
  private fertilizerRecommendations: FertilizerRecommendation[] = [];
  private diseaseDetections: DiseaseDetection[] = [];
  private irrigationLogs: any[] = [];
  private cropId = 1;
  private fertilizerId = 1;
  private diseaseId = 1;
  private irrigationId = 1;

  async getUser(id: string): Promise<User | undefined> {
    return authStorage.getUser(id);
  }

  async upsertUser(user: InsertUser): Promise<User> {
    return authStorage.upsertUser(user);
  }

  async createCropPrediction(data: InsertCropPrediction): Promise<CropPrediction> {
    const result: CropPrediction = {
      id: this.cropId++,
      userId: data.userId ?? null,
      nitrogen: data.nitrogen,
      phosphorus: data.phosphorus,
      potassium: data.potassium,
      temperature: data.temperature,
      humidity: data.humidity,
      ph: data.ph,
      rainfall: data.rainfall,
      predictedCrop: data.predictedCrop,
      createdAt: new Date(),
    };
    this.cropPredictions.unshift(result);
    return result;
  }

  async getCropPredictions(userId?: string): Promise<CropPrediction[]> {
    return this.cropPredictions.filter((item) => item.userId === (userId ?? null));
  }

  async createFertilizerRecommendation(
    data: InsertFertilizerRecommendation,
  ): Promise<FertilizerRecommendation> {
    const result: FertilizerRecommendation = {
      id: this.fertilizerId++,
      userId: data.userId ?? null,
      nitrogen: data.nitrogen,
      phosphorus: data.phosphorus,
      potassium: data.potassium,
      soilType: data.soilType,
      cropType: data.cropType,
      recommendedFertilizer: data.recommendedFertilizer,
      createdAt: new Date(),
    };
    this.fertilizerRecommendations.unshift(result);
    return result;
  }

  async getFertilizerRecommendations(userId?: string): Promise<FertilizerRecommendation[]> {
    return this.fertilizerRecommendations.filter(
      (item) => item.userId === (userId ?? null),
    );
  }

  async createDiseaseDetection(data: InsertDiseaseDetection): Promise<DiseaseDetection> {
    const result: DiseaseDetection = {
      id: this.diseaseId++,
      userId: data.userId ?? null,
      imageUrl: data.imageUrl,
      detectedDisease: data.detectedDisease,
      confidence: data.confidence,
      createdAt: new Date(),
    };
    this.diseaseDetections.unshift(result);
    return result;
  }

  async getDiseaseDetections(userId?: string): Promise<DiseaseDetection[]> {
    return this.diseaseDetections.filter((item) => item.userId === (userId ?? null));
  }

  async createIrrigationLog(data: any): Promise<any> {
    const result = {
      id: this.irrigationId++,
      ...data,
      createdAt: new Date(),
    };
    this.irrigationLogs.unshift(result);
    return result;
  }

  async getIrrigationLogs(userId?: string): Promise<any[]> {
    return this.irrigationLogs.filter((item) => item.userId === (userId ?? null));
  }
}

export const storage =
  hasDatabase && db ? new DatabaseStorage() : new MemoryStorage();
