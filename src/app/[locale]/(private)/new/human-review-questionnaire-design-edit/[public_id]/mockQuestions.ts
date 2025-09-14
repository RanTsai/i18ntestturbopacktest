import { Question } from "@/lib/schema/questionaire-schema";
import { FormSchema } from "@/lib/schema/questionaire-schema";

export const mockQuestions: Question[] = [
    {
        id: "q1",
        type: "image-select",
        label: "請選擇你覺得表現最佳的縮圖",
        required: true,
        options: [
            { value: "thumb_1", label: "https://ijuyminrnhiekoxybhgm.supabase.co/storage/v1/object/public/fallback-thumbnails//TheMonkeyMan%20V3.jpg" },
            { value: "thumb_2", label: "https://ijuyminrnhiekoxybhgm.supabase.co/storage/v1/object/public/fallback-thumbnails//artwork%20(4).png" },
            { value: "thumb_3", label: "https://ijuyminrnhiekoxybhgm.supabase.co/storage/v1/object/public/fallback-thumbnails//Thumbnail%20-%20Short%202.png" },
            { value: "thumb_4", label: "https://ijuyminrnhiekoxybhgm.supabase.co/storage/v1/object/public/fallback-thumbnails//Thumbnail%20-%20Short%201.png" }
        ]
    },
    {
        id: "q1_reason",
        type: "text",
        label: "請簡述你選擇此縮圖的原因",
        required: true,
        placeholder: "輸入原因…"
    },
    {
        id: "q2",
        type: "title-select",
        label: "請選擇你覺得最吸引人的標題",
        required: true,
        options: [
            { value: "title_1", label: "你不會相信發生了什麼事…" },
            { value: "title_2", label: "這是2024最好的教學影片" },
            { value: "title_3", label: "看完這部影片，你會重新思考人生" },
            { value: "title_4", label: "這個標題為何點閱率爆炸？原因竟然是…" }
        ]
    },
    {
        id: "q2_reason",
        type: "text",
        label: "請簡述你選擇此標題的原因",
        required: true,
        placeholder: "輸入原因…"
    }
]


export const formData: FormSchema =
{
    "form_id": "human_review_settings",
    "title": "Human Review Questionnaire", // Added title property
    "channel_logo": "channel_logo_url",
    "channel_name": "Channel Name",
    "channel_description": "Channel description",
    "version": "v1",
    "locale": "en",
    "sections": [
        {
            "id": "review_deadline",
            "title": "Set Review Deadline",
            "questions": [
                {
                    "id": "review_deadline_date",
                    "type": "date",
                    "label": "Select a deadline for when reviews must be completed.",
                    "required": true
                }
            ]
        },
        {
            "id": "review_visibility",
            "title": "Feedback Visibility",
            "questions": [
                {
                    "id": "feedback_visibility_choice",
                    "type": "radio",
                    "label": "Do you want to make the review results public?",
                    "options": [
                        {
                            "value": "yes",
                            "label": "Yes"
                        },
                        {
                            "value": "no",
                            "label": "No"
                        }
                    ],
                    "required": true
                }
            ]
        },
        {
            "id": "notifications",
            "title": "Notifications",
            "questions": [
                {
                    "id": "email_notify",
                    "type": "checkbox",
                    "label": "Send me an email when new reviews come in."
                }
            ]
        },
        {
            "id": "review_preferences",
            "title": "Review Preferences",
            "questions": [
                {
                    "id": "rater_credit_reward",
                    "type": "number",
                    "label": "Would you like to reward the raters with credit?",
                    "placeholder": "Enter credits to reward"
                },
                {
                    "id": "wanted_review_count",
                    "type": "number",
                    "label": "How many ratings would you like to have?",
                    "placeholder": "Enter the number"
                },
                {
                    "id": "review_audience_visibility",
                    "type": "radio",
                    "label": "Would you make the review public? Not public means only your subscriber will see this.",
                    "options": [
                        {
                            "value": "public",
                            "label": "Public"
                        },
                        {
                            "value": "private",
                            "label": "Subscribers Only"
                        }
                    ],
                    "required": true
                },
                {
                    "id": "additional_message_to_rater",
                    "type": "text",
                    "label": "What additional message would you like to tell the rater?",
                    "placeholder": "e.g., Please be honest, your opinion matters!"
                },
                {
                    "id": "display_channel_detail",
                    "type": "radio",
                    "label": "Show channel information",
                    "options": [
                        {
                            "value": "Yes",
                            "label": "Show Channel information for more accurate rating"
                        },
                        {
                            "value": "No",
                            "label": "Don't Show channel information, I want to test the thumbnails and titles alone"
                        }
                    ]
                }
            ]
        }
    ]
}