import { useAgriAI } from "@/hooks/use-agri-ai";
import { Sprout, TestTube, Bug, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { StatCard } from "@/components/StatCard";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { cropHistory, fertilizerHistory, diseaseHistory } = useAgriAI();

  const cropCount = cropHistory.data?.length || 0;
  const fertilizerCount = fertilizerHistory.data?.length || 0;
  const diseaseCount = diseaseHistory.data?.length || 0;
  
  const recentCrops = cropHistory.data?.slice(0, 3) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/80 text-white p-8 md:p-12 shadow-xl"
      >
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Smart Agriculture Dashboard
          </h1>
          <p className="text-primary-foreground/90 text-lg mb-8">
            Leverage AI to optimize your harvest. Get real-time predictions for crops, fertilizers, and disease detection.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/crop-predict" className="bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors inline-flex items-center shadow-lg">
              Analyze Soil <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
        {/* Unsplash image: Wheat field closeup */}
        {/* <img 
          src="https://images.unsplash.com/photo-1625246333195-58197bd47d26?auto=format&fit=crop&q=80&w=1000" 
          alt="Agriculture Background" 
          className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-20 mix-blend-overlay"
        /> */}
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard
            title="Total Crop Analyses"
            value={cropCount}
            icon={<Sprout className="w-5 h-5" />}
            trend={cropCount > 0 ? "+12% this week" : undefined}
            trendUp={true}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard
            title="Fertilizer Plans"
            value={fertilizerCount}
            icon={<TestTube className="w-5 h-5" />}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StatCard
            title="Disease Scans"
            value={diseaseCount}
            icon={<Bug className="w-5 h-5" />}
          />
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl border border-border shadow-sm p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-display">Recent Crop Predictions</h2>
            <Link href="/history" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          
          {cropHistory.isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : recentCrops.length > 0 ? (
            <div className="space-y-4">
              {recentCrops.map((crop) => (
                <div key={crop.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                      <Sprout size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{crop.predictedCrop}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(crop.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-background border border-border">
                      {crop.temperature}°C
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No crop predictions yet. Start by analyzing your soil!
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col justify-center items-center text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
            <Bug size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display mb-2">Plant Disease Detection</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Upload a photo of your crop leaf to instantly identify diseases and get treatment recommendations.
            </p>
          </div>
          <Link href="/disease" className="btn-primary w-full max-w-xs">
            Scan Plant
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
