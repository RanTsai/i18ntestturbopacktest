import { FormSchema } from "@/lib/schema/questionaire-schema"

export const formData: FormSchema =
{
    "form_id": "reviewer_feedback_settings",
    "version": "v1",
    "locale": "en",
    "title": "Human Review Questionnaire", // Added title property
    "channel_logo": "channel_logo_url",
    "channel_name": "Channel Name",
    "channel_description": "Channel description",
    "sections": [
        {
            "id": "rater_feedback_preferences",
            "title": "Reviewer Preferences and Support",
            "questions": [
                {
                    "id": "accept_reward",
                    "type": "radio",
                    "label": "Do you want to receive credits as a reward?",
                    "options": [
                        { "value": "yes", "label": "Yes, I want credits" },
                        { "value": "no", "label": "No, I'm happy to help for free" }
                    ],
                    "required": true
                },
                {
                    "id": "follow_creator_for_future",
                    "type": "radio",
                    "label": "Would you like to follow this creator and review their future content?",
                    "options": [
                        { "value": "yes", "label": "Yes, I'd love to help again" },
                        { "value": "no", "label": "No, just this time" }
                    ],
                    "required": true
                },
                {
                    "id": "allow_public_display",
                    "type": "radio",
                    "label": "Do you allow your review and rating to be shown publicly?",
                    "options": [
                        { "value": "yes", "label": "Yes, show my review" },
                        { "value": "no", "label": "No, keep it anonymous" }
                    ],
                    "required": true
                },
                {
                    "id": "message_to_creator",
                    "type": "text",
                    "label": "Would you like to leave a message for the creator?",
                    "placeholder": "e.g., I really liked your style. Keep going!",
                    "required": false
                },
                {
                    "id": "support_creator_credit",
                    "type": "number",
                    "label": "Would you like to support this creator with extra credits?",
                    "placeholder": "Enter the number of credits you'd like to give",
                    "required": false
                }
            ]
        }
    ]
}
