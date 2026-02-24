import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAgriAI } from "@/hooks/use-agri-ai";
import { Loader2, Droplets, Thermometer, Wind, Gauge, Timer, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const irrigationSchema = z.object({
  soilMoisture: z.coerce.number().min(0).max(100),
  growthStage: z.string().min(1, "Required"),
  evapotranspiration: z.coerce.number().min(0).max(20),
  temperature: z.coerce.number().min(0).max(60),
  humidity: z.coerce.number().min(0).max(100),
});

type IrrigationFormData = z.infer<typeof irrigationSchema>;

export default function IrrigationAdvisor() {
  const { predictIrrigation } = useAgriAI();
  const [result, setResult] = useState<any>(null);

  const form = useForm<IrrigationFormData>({
    resolver: zodResolver(irrigationSchema),
    defaultValues: {
      soilMoisture: 35,
      growthStage: "Vegetative",
      evapotranspiration: 5.2,
      temperature: 28.5,
      humidity: 65
    }
  });

  const onSubmit = (data: IrrigationFormData) => {
    predictIrrigation.mutate(data, {
      onSuccess: (res) => setResult(res)
    });
  };

  const InputGroup = ({ label, name, icon: Icon, unit, type = "number", options = null, ...props }: any) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" /> {label}
      </label>
      <div className="relative">
        {options ? (
          <select
            {...form.register(name)}
            className="input-field pr-10 appearance-none bg-background"
          >
            {options.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <>
            <input
              {...form.register(name)}
              {...props}
              type={type}
              step="0.1"
              className={cn(
                "input-field pr-12",
                form.formState.errors[name] && "border-destructive focus-visible:ring-destructive"
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
              {unit}
            </span>
          </>
        )}
      </div>
      {form.formState.errors[name] && (
        <p className="text-xs text-destructive">{form.formState.errors[name]?.message as string}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Smart Irrigation Advisor</h1>
            <p className="text-muted-foreground">
              Optimize your water usage with AI-driven irrigation timing and amount recommendations.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4">Soil & Crop State</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputGroup name="soilMoisture" label="Soil Moisture" icon={Droplets} unit="%" />
                  <InputGroup 
                    name="growthStage" 
                    label="Growth Stage" 
                    icon={Gauge} 
                    options={["Initial", "Vegetative", "Flowering", "Maturity"]} 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4">Environmental Factors</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputGroup name="evapotranspiration" label="Evapotranspiration" icon={Wind} unit="mm/day" />
                  <InputGroup name="temperature" label="Temperature" icon={Thermometer} unit="°C" />
                  <InputGroup name="humidity" label="Humidity" icon={Droplets} unit="%" />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={predictIrrigation.isPending}
                  className="w-full btn-primary text-lg h-14"
                >
                  {predictIrrigation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Calculating...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" /> Get Irrigation Advice
                    </>
                  )}
                </button>
              </div>
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
                className="space-y-6"
              >
                <div className="bg-primary text-primary-foreground rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Droplets size={160} />
                  </div>
                  
                  <h3 className="text-xl font-medium mb-2 opacity-90 text-center">Recommended Irrigation</h3>
                  <div className="text-5xl font-display font-bold mb-6 text-center tracking-tight">
                    {result.recommended_liters} <span className="text-2xl opacity-80">Liters/Acre</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center">
                      <Timer className="w-5 h-5 mx-auto mb-1 opacity-80" />
                      <div className="text-xl font-bold">{result.best_time}</div>
                      <div className="text-xs opacity-70 uppercase tracking-wider">Best Time</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center">
                      <Zap className="w-5 h-5 mx-auto mb-1 opacity-80" />
                      <div className="text-xl font-bold">{result.water_savings_percentage}%</div>
                      <div className="text-xs opacity-70 uppercase tracking-wider">Water Saved</div>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 text-center">
                  <h4 className="font-semibold mb-2">Sustainable Impact</h4>
                  <p className="text-sm text-muted-foreground">
                    By following this AI-optimized schedule, you are contributing to SDG 6 (Clean Water and Sanitation) 
                    and reducing overall operational costs.
                  </p>
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
                  <Droplets size={40} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Awaiting Parameters</h3>
                <p className="text-muted-foreground">
                  Provide your soil and weather data to receive an optimized irrigation plan.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
