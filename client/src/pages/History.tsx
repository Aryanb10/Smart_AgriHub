import { useAgriAI } from "@/hooks/use-agri-ai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sprout, TestTube, Bug } from "lucide-react";
import { cn } from "@/lib/utils";

export default function History() {
  const { cropHistory, fertilizerHistory, diseaseHistory } = useAgriAI();

  const HistoryTable = ({ data, type }: { data: any[]; type: "crop" | "fertilizer" | "disease" }) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
          <p className="text-muted-foreground">No history records found.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">
                {type === "crop" && "Predicted Crop"}
                {type === "fertilizer" && "Recommended Fertilizer"}
                {type === "disease" && "Detected Disease"}
              </th>
              <th className="px-6 py-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-medium text-foreground">
                  {type === "crop" && item.predictedCrop}
                  {type === "fertilizer" && item.recommendedFertilizer}
                  {type === "disease" && item.detectedDisease}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {type === "crop" && (
                    <span className="inline-flex gap-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">pH: {item.ph}</span>
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">Temp: {item.temperature}°C</span>
                    </span>
                  )}
                  {type === "fertilizer" && <span>For {item.cropType} in {item.soilType} soil</span>}
                  {type === "disease" && (
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded",
                        item.confidence > 0.8 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800",
                      )}
                    >
                      Confidence: {(item.confidence * 100).toFixed(1)}%
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-display font-bold text-foreground mb-8">Analysis History</h1>

      <Tabs defaultValue="crop" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl w-full sm:w-auto flex">
          <TabsTrigger value="crop" className="rounded-lg flex-1 sm:flex-none data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Sprout className="w-4 h-4 mr-2" /> Crop History
          </TabsTrigger>
          <TabsTrigger value="fertilizer" className="rounded-lg flex-1 sm:flex-none data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <TestTube className="w-4 h-4 mr-2" /> Fertilizer
          </TabsTrigger>
          <TabsTrigger value="disease" className="rounded-lg flex-1 sm:flex-none data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Bug className="w-4 h-4 mr-2" /> Disease
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crop">
          {cropHistory.isLoading ? <div className="p-8 text-center"><Loader2 className="animate-spin w-8 h-8 mx-auto" /></div> : <HistoryTable data={cropHistory.data || []} type="crop" />}
        </TabsContent>
        <TabsContent value="fertilizer">
          {fertilizerHistory.isLoading ? <div className="p-8 text-center"><Loader2 className="animate-spin w-8 h-8 mx-auto" /></div> : <HistoryTable data={fertilizerHistory.data || []} type="fertilizer" />}
        </TabsContent>
        <TabsContent value="disease">
          {diseaseHistory.isLoading ? <div className="p-8 text-center"><Loader2 className="animate-spin w-8 h-8 mx-auto" /></div> : <HistoryTable data={diseaseHistory.data || []} type="disease" />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
