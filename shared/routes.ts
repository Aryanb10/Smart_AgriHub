import { z } from 'zod';
import { 
  insertCropPredictionSchema, 
  insertFertilizerRecommendationSchema, 
  cropPredictions,
  fertilizerRecommendations,
  diseaseDetections
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  crop: {
    predict: {
      method: 'POST' as const,
      path: '/api/predict/crop' as const,
      input: insertCropPredictionSchema.omit({ predictedCrop: true, userId: true }),
      responses: {
        200: z.custom<typeof cropPredictions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/history/crop' as const,
      responses: {
        200: z.array(z.custom<typeof cropPredictions.$inferSelect>()),
      },
    },
  },
  fertilizer: {
    predict: {
      method: 'POST' as const,
      path: '/api/predict/fertilizer' as const,
      input: insertFertilizerRecommendationSchema.omit({ recommendedFertilizer: true, userId: true }),
      responses: {
        200: z.custom<typeof fertilizerRecommendations.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/history/fertilizer' as const,
      responses: {
        200: z.array(z.custom<typeof fertilizerRecommendations.$inferSelect>()),
      },
    },
  },
  disease: {
    detect: {
      method: 'POST' as const,
      path: '/api/detect/disease' as const,
      // Input is FormData, handled specifically in frontend/backend
      responses: {
        200: z.custom<typeof diseaseDetections.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/history/disease' as const,
      responses: {
        200: z.array(z.custom<typeof diseaseDetections.$inferSelect>()),
      },
    },
  },
};

// ============================================
// HELPER
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
