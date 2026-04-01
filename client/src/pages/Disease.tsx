import { useState, useRef } from "react";
import { useAgriAI } from "@/hooks/use-agri-ai";
import { Loader2, Bug, Upload, AlertTriangle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { analyzeLeafImage, type DiseaseResult } from "@/lib/disease-detection";

type DetectionResponse = DiseaseResult & {
  id?: number;
  imageUrl?: string;
  detectedDisease?: string;
};

export default function Disease() {
  const { detectDisease } = useAgriAI();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    detectDisease.mutate(formData, {
      onSuccess: (res) => setResult(res),
    });
  };

  const displayDisease = result?.detectedDisease ?? result?.disease ?? "";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-display font-bold text-foreground mb-4">Disease Detection</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Upload a clear photo of an affected plant leaf. The detector identifies Healthy leaves, Powdery Mildew, and Rust from visible leaf patterns.
        </p>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
        <div
          className={cn(
            "border-3 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer relative overflow-hidden group",
            preview ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50",
          )}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

          {preview ? (
            <div className="relative z-10">
              <img src={preview} alt="Upload preview" className="max-h-80 mx-auto rounded-lg shadow-lg" />
              <div className="mt-4 text-sm text-muted-foreground">Click or drop to replace</div>
            </div>
          ) : (
            <div className="py-12">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground group-hover:scale-110 transition-transform duration-300">
                <Upload size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Click or drag image here</h3>
              <p className="text-muted-foreground text-sm">Supports JPG and PNG leaf photos</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!file || detectDisease.isPending}
            className="btn-primary w-full max-w-md text-lg h-14 disabled:opacity-50"
          >
            {detectDisease.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Image...
              </>
            ) : (
              <>
                <Bug className="mr-2 h-5 w-5" /> Identify Disease
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <div className="bg-white dark:bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
              <div
                className={cn(
                  "p-4 text-white font-medium text-center",
                  displayDisease.toLowerCase().includes("healthy") ? "bg-green-500" : "bg-red-500",
                )}
              >
                Detection Result
              </div>
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  {displayDisease.toLowerCase().includes("healthy") ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  )}
                </div>
                <h2 className="text-4xl font-display font-bold mb-2 tracking-tight">{displayDisease}</h2>

                <div className="flex flex-wrap items-center justify-center gap-6 my-8 py-6 border-y border-border/50">
                  <div className="flex flex-col items-center">
                    <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-bold">Confidence</div>
                    <div className="text-3xl font-display font-bold text-primary">{(result.confidence * 100).toFixed(0)}%</div>
                  </div>
                  <div className="w-px h-10 bg-border hidden md:block"></div>
                  <div className="flex flex-col items-center">
                    <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-bold">Severity</div>
                    <div
                      className={cn(
                        "text-xl font-bold px-4 py-1 rounded-full",
                        result.severity === "Moderate"
                          ? "bg-destructive/10 text-destructive"
                          : result.severity === "Mild"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-primary/10 text-primary",
                      )}
                    >
                      {result.severity}
                    </div>
                  </div>
                </div>

                {!displayDisease.toLowerCase().includes("healthy") && result.treatment && (
                  <div className="mt-8 space-y-6 text-left max-w-2xl mx-auto">
                    <h4 className="font-bold text-xl flex items-center gap-2 text-foreground">
                      <CheckCircle className="w-6 h-6 text-primary" /> Recommended Recovery Plan
                    </h4>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="group bg-primary/[0.03] hover:bg-primary/[0.05] p-5 rounded-2xl border border-primary/10 transition-colors">
                        <div className="text-[10px] font-bold text-primary uppercase mb-2 tracking-widest">Organic Approach</div>
                        <p className="text-sm leading-relaxed text-foreground/90">{result.treatment.organic}</p>
                      </div>

                      <div className="group bg-secondary/30 hover:bg-secondary/50 p-5 rounded-2xl border border-border transition-colors">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase mb-2 tracking-widest">Chemical Control</div>
                        <p className="text-sm leading-relaxed text-foreground/90">{result.treatment.chemical}</p>
                      </div>

                      <div className="group bg-amber-500/[0.03] hover:bg-amber-500/[0.05] p-5 rounded-2xl border border-amber-500/10 transition-colors">
                        <div className="text-[10px] font-bold text-amber-600 uppercase mb-2 tracking-widest">Prevention & Hygiene</div>
                        <p className="text-sm leading-relaxed text-foreground/90">{result.treatment.prevention}</p>
                      </div>
                    </div>
                  </div>
                )}

                {displayDisease.toLowerCase().includes("healthy") && (
                  <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-6 text-left max-w-2xl mx-auto mt-8">
                    <p className="text-green-700 dark:text-green-400 text-sm leading-relaxed">
                      Your leaf appears healthy. Continue balanced watering, sunlight, and regular monitoring.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
