"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { InsertUserSignUpQuestionareToSupabase } from "@/actions/supabase/supabase-user-signup";
import { FormSchema } from "@/lib/schema/questionaire-schema"; // ⬅️ 你可抽出共用型別或直接 inline
import GeneralQuestionaire from "./general-questionare";

interface Props {
  formData: FormSchema;
}

const DynamicSignupForm = ({ formData }: Props) => {
  const { control, handleSubmit, register, reset } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: any) => {
    setLoading(true);
    console.log("current goal:", values);

    const result = await InsertUserSignUpQuestionareToSupabase(values);

    setLoading(false);
    if (result.success) reset();
    else console.error("Submit failed:", result.message);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GeneralQuestionaire
        formData={formData}
        loading={loading}
        onSubmit={handleSubmit(onSubmit)} // 注意包過一次
        control={control}
        register={register}
      />
    </form>
  );
};

export default DynamicSignupForm;