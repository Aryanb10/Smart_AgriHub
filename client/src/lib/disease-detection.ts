export type DiseaseResult = {
  disease: "Healthy" | "Powdery Mildew" | "Rust";
  confidence: number;
  severity: "Healthy" | "Mild" | "Moderate";
  treatment: {
    organic: string;
    chemical: string;
    prevention: string;
  };
};

const TREATMENTS: Record<DiseaseResult["disease"], DiseaseResult["treatment"]> = {
  Healthy: {
    organic: "Continue regular watering and balanced nutrition.",
    chemical: "No chemical treatment needed.",
    prevention: "Maintain airflow, avoid overwatering, and inspect leaves weekly.",
  },
  "Powdery Mildew": {
    organic: "Spray neem oil or a baking-soda solution on affected leaves.",
    chemical: "Apply a sulfur or potassium bicarbonate fungicide if spread increases.",
    prevention: "Reduce leaf wetness, improve spacing, and remove heavily infected foliage.",
  },
  Rust: {
    organic: "Remove infected leaves and apply compost tea or neem-based spray.",
    chemical: "Use a labeled fungicide such as mancozeb or copper-based control.",
    prevention: "Avoid overhead irrigation and keep crop residue away from healthy plants.",
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to read image"));
    };
    img.src = url;
  });
}

export async function analyzeLeafImage(file: File): Promise<DiseaseResult> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas is not available in this browser");
  }

  const targetWidth = 224;
  const targetHeight = Math.max(1, Math.round((img.height / img.width) * targetWidth));
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const { data } = ctx.getImageData(0, 0, targetWidth, targetHeight);
  let leafPixels = 0;
  let greenPixels = 0;
  let whitePixels = 0;
  let rustPixels = 0;
  let darkPixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const brightness = (r + g + b) / 3;
    const saturation = max === 0 ? 0 : (max - min) / max;

    const looksLikeLeaf = g > 45 || r > 70 || brightness > 90;
    if (!looksLikeLeaf) {
      continue;
    }

    leafPixels += 1;

    if (g > r * 0.95 && g > b * 1.05) {
      greenPixels += 1;
    }

    if (brightness > 170 && saturation < 0.22) {
      whitePixels += 1;
    }

    if (r > 110 && g > 55 && g < 185 && b < 130 && r > g * 1.08) {
      rustPixels += 1;
    }

    if (brightness < 65) {
      darkPixels += 1;
    }
  }

  const total = Math.max(leafPixels, 1);
  const greenRatio = greenPixels / total;
  const whiteRatio = whitePixels / total;
  const rustRatio = rustPixels / total;
  const darkRatio = darkPixels / total;

  if (whiteRatio > 0.12 && greenRatio > 0.18) {
    const confidence = clamp(0.72 + whiteRatio * 0.9, 0.72, 0.95);
    return {
      disease: "Powdery Mildew",
      confidence,
      severity: whiteRatio > 0.22 ? "Moderate" : "Mild",
      treatment: TREATMENTS["Powdery Mildew"],
    };
  }

  if (rustRatio > 0.08 || (rustRatio > 0.05 && darkRatio > 0.08)) {
    const confidence = clamp(0.7 + rustRatio * 1.2 + darkRatio * 0.25, 0.7, 0.94);
    return {
      disease: "Rust",
      confidence,
      severity: rustRatio > 0.16 ? "Moderate" : "Mild",
      treatment: TREATMENTS.Rust,
    };
  }

  const confidence = clamp(0.76 + greenRatio * 0.2 - whiteRatio * 0.15 - rustRatio * 0.1, 0.76, 0.96);
  return {
    disease: "Healthy",
    confidence,
    severity: "Healthy",
    treatment: TREATMENTS.Healthy,
  };
}
