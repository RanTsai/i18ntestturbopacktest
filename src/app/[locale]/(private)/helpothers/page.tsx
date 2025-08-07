import React from "react";
import DynamicSignupForm from "@/components/ui/forms/dynamic-signup-form";
import fs from "fs";
import path from "path";
import { FormSchema } from "@/lib/schema/questionaire-schema"; 

export default async function SignupPage() {
  const filePath = path.join(process.cwd(), "src/lib/form-data/reviewer/review-packaging-questionare.json");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const formData: FormSchema = JSON.parse(fileContent);

 return (
  <div className="px-6 py-10">   

    {/* Main Form */}
    <div className="flex justify-center">
      <DynamicSignupForm formData={formData} />
    </div>
  </div>
);
}