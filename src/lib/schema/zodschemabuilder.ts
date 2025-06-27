import { z, ZodTypeAny, ZodObject } from "zod";

function buildZodSchemaFromJson(json: any): ZodTypeAny {
  if (typeof json === "string") {
    if (json === "string") return z.string();
    if (json === "number") return z.number();
    if (json === "boolean") return z.boolean();
    return z.any();
  }

  if (typeof json === "object" && !Array.isArray(json)) {
    const shape: Record<string, ZodTypeAny> = {};
    for (const key in json) {
      shape[key] = buildZodSchemaFromJson(json[key]);
    }
    return z.object(shape);
  }

  if (Array.isArray(json)) {
    return z.array(z.any()); // or recursively define item type if needed
  }

  return z.any();
}


const jsonSchema = {
  overall_impression: "string",
  title_strength: "string",
  thumbnail_strength: "string",
  synergy: "string",
  explanation: "string",
  scores: {
    clickability: "number",
    curiosity: "number",
    brightness: "number",
    relevance: "number",
    emotion: "number"
  }
};

const zodSchema = buildZodSchemaFromJson(jsonSchema);

// 👉 測試結果是否能 parse
const parsed = zodSchema.parse({
  overall_impression: "Nice colors",
  title_strength: "Catchy",
  thumbnail_strength: "Bright and clear",
  synergy: "Works well",
  explanation: "Eye-catching design attracts viewers",
  scores: {
    clickability: 4.5,
    curiosity: 3.7,
    brightness: 4,
    relevance: 5,
    emotion: 3
  }
});

// import { buildSchemaFromConfig } from '@/lib/schema/build';
// import { useGlobalStore } from '@/store/global-store';

// useEffect(() => {
//   const config = { title: "string", score: "number" };
//   const schema = buildSchemaFromConfig(config);
//   useGlobalStore.getState().setSchema(schema); // ✅ 儲存進 GlobalStore
// }, []);