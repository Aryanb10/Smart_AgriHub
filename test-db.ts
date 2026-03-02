import { db } from "./server/db";
import { cropPredictions } from "./shared/schema";

async function test() {
  try {
    console.log("Attempting to insert into SQLite using PG schema...");
    await db.insert(cropPredictions).values({
      nitrogen: 10,
      phosphorus: 20,
      potassium: 30,
      temperature: 25,
      humidity: 50,
      ph: 6.5,
      rainfall: 100,
      predictedCrop: "test",
      userId: "test-user"
    });
    console.log("Success!");
  } catch (e) {
    console.error("Failed:", e);
  }
}

test();
