"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import FeedbackDialog, { FeedbackData } from "@/components/ui/feedback/user-feedback-form";
import GeneralQuestionaire from "@/components/ui/forms/general-questionare";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { FormSchema } from "@/lib/schema/creator-signup-questionaire-schema";

interface Props {
  formData: FormSchema;
}

export default function HumanReviewQuestionaireDesignForm({ formData }: Props) {
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { control, register, handleSubmit } = useForm();

  const onQuestionnaireSubmit = async (values: any) => {
    setLoading(true);
    console.log("👤 Human Feedback Submitted", values);
    // TODO: 可串接 Supabase 儲存問卷答案
    setLoading(false);
  };

  const onFeedbackSubmit = (feedback: FeedbackData) => {
    console.log("📣 User subjective feedback:", feedback);
    // TODO: 可串接 Supabase 儲存
  };

  return (
    <div className="space-y-6 mt-10">
      

      {/* 問卷區塊 */}
      <AnimatePresence>
        {isQuestionnaireOpen && (
          <motion.div
            key="human-questionnaire"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit(onQuestionnaireSubmit)} className="mt-6 space-y-6">
              <GeneralQuestionaire
                formData={formData}
                control={control}
                register={register}
                loading={loading}
                onSubmit={handleSubmit(onQuestionnaireSubmit)}
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 使用者主觀回饋按鈕 */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Tell us if it helped you</h2>
        <Button onClick={() => setIsFeedbackOpen(true)}>
          Share Your Feedback
        </Button>
      </div>

      {/* 使用者主觀回饋 Dialog */}
      {isFeedbackOpen && (
        <FeedbackDialog
          isOpen={isFeedbackOpen}
          setIsOpen={setIsFeedbackOpen}
          onSubmit={onFeedbackSubmit}
        />
      )}
    </div>
  );
}
