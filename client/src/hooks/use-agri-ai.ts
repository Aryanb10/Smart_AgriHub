import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type PredictCropRequest, type PredictFertilizerRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useAgriAI() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // === CROP PREDICTION ===
  const predictCropMutation = useMutation({
    mutationFn: async (data: Omit<PredictCropRequest, "id" | "createdAt" | "predictedCrop" | "userId">) => {
      const res = await fetch(api.crop.predict.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to predict crop");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.crop.history.path] });
      toast({ title: "Prediction Complete", description: "Successfully analyzed soil data." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const cropHistory = useQuery({
    queryKey: [api.crop.history.path],
    queryFn: async () => {
      const res = await fetch(api.crop.history.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch crop history");
      return await res.json();
    },
  });

  // === FERTILIZER RECOMMENDATION ===
  const predictFertilizerMutation = useMutation({
    mutationFn: async (data: Omit<PredictFertilizerRequest, "id" | "createdAt" | "recommendedFertilizer" | "userId">) => {
      const res = await fetch(api.fertilizer.predict.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to recommend fertilizer");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.fertilizer.history.path] });
      toast({ title: "Recommendation Ready", description: "Fertilizer recommendation generated." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const fertilizerHistory = useQuery({
    queryKey: [api.fertilizer.history.path],
    queryFn: async () => {
      const res = await fetch(api.fertilizer.history.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch fertilizer history");
      return await res.json();
    },
  });

  // === DISEASE DETECTION ===
  const detectDiseaseMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(api.disease.detect.path, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to detect disease");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.disease.history.path] });
      toast({ title: "Analysis Complete", description: "Plant disease detection finished." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const diseaseHistory = useQuery({
    queryKey: [api.disease.history.path],
    queryFn: async () => {
      const res = await fetch(api.disease.history.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch disease history");
      return await res.json();
    },
  });

  // === IRRIGATION ADVISOR ===
  const predictIrrigationMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.irrigation.predict.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to predict irrigation");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.irrigation.history.path] });
      toast({ title: "Advice Ready", description: "Irrigation plan generated successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const irrigationHistory = useQuery({
    queryKey: [api.irrigation.history.path],
    queryFn: async () => {
      const res = await fetch(api.irrigation.history.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch irrigation history");
      return await res.json();
    },
  });

  return {
    predictCrop: predictCropMutation,
    cropHistory,
    predictFertilizer: predictFertilizerMutation,
    fertilizerHistory,
    detectDisease: detectDiseaseMutation,
    diseaseHistory,
    predictIrrigation: predictIrrigationMutation,
    irrigationHistory,
  };
}
