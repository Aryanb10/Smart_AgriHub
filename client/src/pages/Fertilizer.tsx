import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAgriAI } from "@/hooks/use-agri-ai";
import { Loader2, TestTube, Sprout, FlaskConical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const fertilizerSchema = z.object({
  nitrogen: z.coerce.number().min(0).max(200),
  phosphorus: z.coerce.number().min(0).max(200),
  potassium: z.coerce.number().min(0).max(200),
  soilType: z.string().min(1, "Required"),
  cropType: z.string().min(1, "Required"),
});

type FertilizerFormData = z.infer<typeof fertilizerSchema>;

const soilTypes = ["Clay", "Sandy", "Loam", "Black", "Red"];
const cropTypes = ["Rice", "Maize", "Chickpea", "Kidneybeans", "Pigeonpeas", "Mothbeans", "Mungbean", "Blackgram", "Lentil", "Pomegranate", "Banana", "Mango", "Grapes", "Watermelon", "Muskmelon", "Apple", "Orange", "Papaya", "Coconut", "Cotton", "Jute", "Coffee"];

export default function Fertilizer() {
  const { predictFertilizer } = useAgriAI();
  const [result, setResult] = useState<any>(null);

  const form = useForm<FertilizerFormData>({
    resolver: zodResolver(fertilizerSchema),
    defaultValues: {
      nitrogen: 50,
      phosphorus: 50,
      potassium: 50,
      soilType: "Loam",
      cropType: "Rice"
    }
  });

  const onSubmit = (data: FertilizerFormData) => {
    predictFertilizer.mutate(data, {
      onSuccess: (res) => setResult(res)
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Fertilizer Guide</h1>
            <p className="text-muted-foreground">
              Get personalized fertilizer recommendations based on soil content and target crop.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["nitrogen", "phosphorus", "potassium"].map((nutrient) => (
                  <div key={nutrient} className="space-y-2">
                    <label className="text-sm font-medium text-foreground capitalize flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-accent" /> {nutrient}
                    </label>
                    <input
                      {...form.register(nutrient as any)}
                      type="number"
                      className="input-field"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Soil Type</label>
                  <select {...form.register("soilType")} className="input-field">
                    {soilTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Crop Type</label>
                  <select {...form.register("cropType")} className="input-field">
                    {cropTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={predictFertilizer.isPending}
                className="w-full btn-primary bg-accent hover:bg-accent/90 text-accent-foreground text-lg h-14"
              >
                {predictFertilizer.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-5 w-5" /> Get Recommendation
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:sticky lg:top-24 space-y-6"
        >
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-accent text-accent-foreground rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <TestTube size={200} />
                </div>
                <h3 className="text-xl font-medium mb-4 opacity-90">Recommended Fertilizer</h3>
                
                {/* Dangerously setting HTML because response might contain HTML tags or just text */}
                <div className="text-3xl font-display font-bold mb-6 tracking-tight leading-tight">
                  {result.recommendedFertilizer}
                </div>
                
                <div className="mt-6 pt-6 border-t border-black/10 text-sm opacity-80">
                  For {form.getValues("cropType")} in {form.getValues("soilType")} soil
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-muted/50 border-2 border-dashed border-border rounded-3xl p-12 text-center"
              >
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                  <TestTube size={40} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Fertilizer AI</h3>
                <p className="text-muted-foreground">
                  Optimize your soil nutrients for maximum yield.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
