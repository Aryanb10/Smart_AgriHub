import { 
  users, cropPredictions, fertilizerRecommendations, diseaseDetections,
  type User, type InsertUser,
  type CropPrediction, type InsertCropPrediction,
  type FertilizerRecommendation, type InsertFertilizerRecommendation,
  type DiseaseDetection, type InsertDiseaseDetection
} from "@shared/schema";
import { db } from "./db";
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
    const [result] = await db.insert(cropPredictions).values(data).returning();
    return result;
  }
  async getCropPredictions(userId?: string): Promise<CropPrediction[]> {
    if (!userId) return []; // Or return all if admin? For now, user specific
    return db.select()
      .from(cropPredictions)
      .where(eq(cropPredictions.userId, userId))
      .orderBy(desc(cropPredictions.createdAt));
  }

  // Fertilizer
  async createFertilizerRecommendation(data: InsertFertilizerRecommendation): Promise<FertilizerRecommendation> {
    const [result] = await db.insert(fertilizerRecommendations).values(data).returning();
    return result;
  }
  async getFertilizerRecommendations(userId?: string): Promise<FertilizerRecommendation[]> {
    if (!userId) return [];
    return db.select()
      .from(fertilizerRecommendations)
      .where(eq(fertilizerRecommendations.userId, userId))
      .orderBy(desc(fertilizerRecommendations.createdAt));
  }

  // Disease
  async createDiseaseDetection(data: InsertDiseaseDetection): Promise<DiseaseDetection> {
    const [result] = await db.insert(diseaseDetections).values(data).returning();
    return result;
  }
  async getDiseaseDetections(userId?: string): Promise<DiseaseDetection[]> {
    if (!userId) return [];
    return db.select()
      .from(diseaseDetections)
      .where(eq(diseaseDetections.userId, userId))
      .orderBy(desc(diseaseDetections.createdAt));
  }
}

export const storage = new DatabaseStorage();
