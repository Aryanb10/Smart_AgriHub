import { useState, useRef } from "react";
import { useAgriAI } from "@/hooks/use-agri-ai";
import { Loader2, Bug, Upload, Image as ImageIcon, AlertTriangle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Disease() {
  const { detectDisease } = useAgriAI();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
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

  const handleSubmit = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    detectDisease.mutate(formData, {
      onSuccess: (res) => setResult(res)
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-display font-bold text-foreground mb-4">Disease Detection</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Upload a clear photo of an affected plant leaf. Our AI model will analyze visual patterns to identify diseases.
        </p>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
        <div 
          className={cn(
            "border-3 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer relative overflow-hidden group",
            preview ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          
          {preview ? (
            <div className="relative z-10">
              <img 
                src={preview} 
                alt="Upload preview" 
                className="max-h-80 mx-auto rounded-lg shadow-lg" 
              />
              <div className="mt-4 text-sm text-muted-foreground">Click or drop to replace</div>
            </div>
          ) : (
            <div className="py-12">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground group-hover:scale-110 transition-transform duration-300">
                <Upload size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Click or drag image here</h3>
              <p className="text-muted-foreground text-sm">Supports JPG, PNG (Max 5MB)</p>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="bg-white dark:bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
              <div className={cn(
                "p-4 text-white font-medium text-center",
                result.detectedDisease.toLowerCase().includes("healthy") ? "bg-green-500" : "bg-red-500"
              )}>
                Detection Result
              </div>
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  {result.detectedDisease.toLowerCase().includes("healthy") 
                    ? <CheckCircle className="w-8 h-8 text-green-600" />
                    : <AlertTriangle className="w-8 h-8 text-red-600" />
                  }
                </div>
                <h2 className="text-3xl font-display font-bold mb-2">{result.detectedDisease}</h2>
                <div className="text-muted-foreground mb-6">
                  Confidence Score: <span className="font-semibold text-foreground">{(result.confidence * 100).toFixed(1)}%</span>
                </div>
                
                {/* Placeholder for treatment - could come from backend in future */}
                {!result.detectedDisease.toLowerCase().includes("healthy") && (
                  <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-xl p-4 text-left max-w-2xl mx-auto">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" /> Recommended Action
                    </h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Please consult a local agricultural expert for specific treatment options for {result.detectedDisease}. Isolate the affected plant to prevent spread.
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
