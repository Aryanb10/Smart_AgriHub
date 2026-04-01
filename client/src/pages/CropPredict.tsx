import { useState } from "react";
import { useForm, type FieldErrors, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAgriAI } from "@/hooks/use-agri-ai";
import { Loader2, Sprout, Droplets, Thermometer, CloudRain, FlaskConical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CropPredictionResponse } from "@shared/routes";

const cropSchema = z.object({
  nitrogen: z.coerce.number().min(0, "Must be positive").max(140, "Value too high"),
  phosphorus: z.coerce.number().min(0, "Must be positive").max(145, "Value too high"),
  potassium: z.coerce.number().min(0, "Must be positive").max(205, "Value too high"),
  temperature: z.coerce.number().min(0).max(60),
  humidity: z.coerce.number().min(0).max(100),
  ph: z.coerce.number().min(0).max(14),
  rainfall: z.coerce.number().min(0).max(300),
});

type CropFormData = z.infer<typeof cropSchema>;
type InputGroupProps = {
  label: string;
  name: FieldPath<CropFormData>;
  icon: typeof FlaskConical;
  unit: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function CropPredict() {
  const { predictCrop } = useAgriAI();
  const [result, setResult] = useState<CropPredictionResponse | null>(null);

  const form = useForm<CropFormData>({
    resolver: zodResolver(cropSchema),
    defaultValues: {
      nitrogen: 90,
      phosphorus: 42,
      potassium: 43,
      temperature: 20.8,
      humidity: 82.0,
      ph: 6.5,
      rainfall: 202.9,
    },
  });

  const fieldErrors = form.formState.errors as FieldErrors<CropFormData>;

  const onSubmit = (data: CropFormData) => {
    predictCrop.mutate(data, {
      onSuccess: (res) => setResult(res),
    });
  };

  const InputGroup = ({ label, name, icon: Icon, unit, ...props }: InputGroupProps) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" /> {label}
      </label>
      <div className="relative">
        <input
          {...form.register(name)}
          {...props}
          type="number"
          step="0.1"
          className={cn(
            "input-field pr-12",
            fieldErrors[name] && "border-destructive focus-visible:ring-destructive",
          )}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
          {unit}
        </span>
      </div>
      {fieldErrors[name] && (
        <p className="text-xs text-destructive">{fieldErrors[name]?.message as string}</p>
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
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Crop Advisor</h1>
            <p className="text-muted-foreground">
              Enter soil and environmental parameters to find the most suitable crop to grow.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4">Soil Nutrients</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputGroup name="nitrogen" label="Nitrogen (N)" icon={FlaskConical} unit="mg/kg" />
                  <InputGroup name="phosphorus" label="Phosphorus (P)" icon={FlaskConical} unit="mg/kg" />
                  <InputGroup name="potassium" label="Potassium (K)" icon={FlaskConical} unit="mg/kg" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4">Environment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputGroup name="temperature" label="Temperature" icon={Thermometer} unit="°C" />
                  <InputGroup name="humidity" label="Humidity" icon={Droplets} unit="%" />
                  <InputGroup name="ph" label="Soil pH" icon={FlaskConical} unit="pH" />
                  <InputGroup name="rainfall" label="Rainfall" icon={CloudRain} unit="mm" />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={predictCrop.isPending}
                  className="w-full btn-primary text-lg h-14"
                >
                  {predictCrop.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Sprout className="mr-2 h-5 w-5" /> Predict Best Crop
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
                className="bg-primary text-primary-foreground rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sprout size={200} />
                </div>

                <h3 className="text-xl font-medium mb-4 opacity-90">Recommended Crop</h3>
                <div className="text-6xl font-display font-bold mb-6 capitalize tracking-tight">
                  {result.predictedCrop}
                </div>
                <div className="inline-flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full px-6 py-2 text-sm font-medium">
                  Based on your soil profile
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4 text-center border-t border-white/20 pt-6">
                  <div>
                    <div className="text-2xl font-bold">{form.getValues("temperature")}°</div>
                    <div className="text-xs opacity-70">Temp</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{form.getValues("ph")}</div>
                    <div className="text-xs opacity-70">pH</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{form.getValues("rainfall")}</div>
                    <div className="text-xs opacity-70">Rain (mm)</div>
                  </div>
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
                  <Sprout size={40} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Ready to Analyze</h3>
                <p className="text-muted-foreground">
                  Fill out the form and submit to receive an AI-powered crop recommendation.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
