import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import * as authModels from "./models/auth";

export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const cropPredictions = pgTable("crop_predictions", {
  id: serial("id").primaryKey(),
  userId: text("user_id"), // Optional: link to authModels.users if logged in
  nitrogen: real("nitrogen").notNull(),
  phosphorus: real("phosphorus").notNull(),
  potassium: real("potassium").notNull(),
  temperature: real("temperature").notNull(),
  humidity: real("humidity").notNull(),
  ph: real("ph").notNull(),
  rainfall: real("rainfall").notNull(),
  predictedCrop: text("predicted_crop").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fertilizerRecommendations = pgTable("fertilizer_recommendations", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  nitrogen: real("nitrogen").notNull(),
  phosphorus: real("phosphorus").notNull(),
  potassium: real("potassium").notNull(),
  soilType: text("soil_type").notNull(),
  cropType: text("crop_type").notNull(),
  recommendedFertilizer: text("recommended_fertilizer").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const diseaseDetections = pgTable("disease_detections", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  imageUrl: text("image_url").notNull(),
  detectedDisease: text("detected_disease").notNull(),
  confidence: real("confidence").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
// (Optional: Add relations to users table if strictly enforced, 
// but often loose coupling is fine for MVP analytics)

// === BASE SCHEMAS ===
export const insertCropPredictionSchema = createInsertSchema(cropPredictions).omit({ id: true, createdAt: true });
export const insertFertilizerRecommendationSchema = createInsertSchema(fertilizerRecommendations).omit({ id: true, createdAt: true });
export const insertDiseaseDetectionSchema = createInsertSchema(diseaseDetections).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type CropPrediction = typeof cropPredictions.$inferSelect;
export type InsertCropPrediction = z.infer<typeof insertCropPredictionSchema>;

export type FertilizerRecommendation = typeof fertilizerRecommendations.$inferSelect;
export type InsertFertilizerRecommendation = z.infer<typeof insertFertilizerRecommendationSchema>;

export type DiseaseDetection = typeof diseaseDetections.$inferSelect;
export type InsertDiseaseDetection = z.infer<typeof insertDiseaseDetectionSchema>;

// Request types
export type PredictCropRequest = InsertCropPrediction;
export type PredictFertilizerRequest = InsertFertilizerRecommendation;
// Disease detection request is FormData (image), response includes detection details

// Response types
export type CropPredictionResponse = CropPrediction;
export type FertilizerRecommendationResponse = FertilizerRecommendation;
export type DiseaseDetectionResponse = DiseaseDetection;
