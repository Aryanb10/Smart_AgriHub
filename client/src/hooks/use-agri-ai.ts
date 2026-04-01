import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type PredictCropRequest, type PredictFertilizerRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  try {
    const res = await fetch(input, init);

    if (!res.ok) {
      let message = "Request failed";

      try {
        const body = await res.json();
        message = body?.message || message;
      } catch {
        const text = await res.text();
        if (text) {
          message = text;
        }
      }

      throw new Error(message);
    }

    return res;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Backend server is not reachable. Start the app with npm.cmd run dev and keep it running.");
    }

    throw error;
  }
}

export function useAgriAI() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // === CROP PREDICTION ===
  const predictCropMutation = useMutation({
    mutationFn: async (data: Omit<PredictCropRequest, "id" | "createdAt" | "predictedCrop" | "userId">) => {
      const res = await apiFetch(api.crop.predict.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
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
      const res = await apiFetch(api.crop.history.path, { credentials: "include" });
      return await res.json();
    },
  });

  // === FERTILIZER RECOMMENDATION ===
  const predictFertilizerMutation = useMutation({
    mutationFn: async (data: Omit<PredictFertilizerRequest, "id" | "createdAt" | "recommendedFertilizer" | "userId">) => {
      const res = await apiFetch(api.fertilizer.predict.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
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
      const res = await apiFetch(api.fertilizer.history.path, { credentials: "include" });
      return await res.json();
    },
  });

  // === DISEASE DETECTION ===
  const detectDiseaseMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiFetch(api.disease.detect.path, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
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
      const res = await apiFetch(api.disease.history.path, { credentials: "include" });
      return await res.json();
    },
  });

  // === IRRIGATION ADVISOR ===
  const predictIrrigationMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch(api.irrigation.predict.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
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
      const res = await apiFetch(api.irrigation.history.path, { credentials: "include" });
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
