"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";

export interface FeedbackData {
  name: string;
  email: string;
  rating: number;
  thumbnail: string;
  comments: string;
  aspects: string[];
}

export default function FeedbackDialog({
  isOpen,
  setIsOpen,
  onSubmit,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSubmit: (data: FeedbackData) => void;
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [rating, setRating] = React.useState(0);
  const [thumbnail, setThumbnail] = React.useState("");
  const [comments, setComments] = React.useState("");
  const [aspects, setAspects] = React.useState<string[]>([]);

  const handleAspectToggle = (aspect: string) => {
    setAspects((prev) =>
      prev.includes(aspect)
        ? prev.filter((a) => a !== aspect)
        : [...prev, aspect]
    );
  };

  const handleSubmit = () => {
    const feedback: FeedbackData = {
      name,
      email,
      rating,
      thumbnail,
      comments,
      aspects,
    };
    onSubmit(feedback);
    setIsOpen(false); // Close the dialog
    // Optionally reset fields here
  };

  return (
     <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription>
            Let us know what you think about our thumbnails!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div>
            <p className="text-sm font-medium">Overall Rating</p>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 cursor-pointer ${
                    i <= rating ? "text-yellow-400" : "text-gray-400"
                  }`}
                  onClick={() => setRating(i)}
                  fill={i <= rating ? "currentColor" : "none"}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Which thumbnail did you like the most?</p>
            <select
              className="w-full rounded border px-3 py-2 text-sm text-gray-900"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
            >
              <option value="">Select a thumbnail</option>
              <option value="Product Launch Announcement">Product Launch Announcement</option>
              <option value="Eco-Friendly Product Line">Eco-Friendly Product Line</option>
              <option value="Summer Sale Collection">Summer Sale Collection</option>
            </select>
          </div>

          <div>
            <p className="text-sm font-medium">Your Comments</p>
            <Textarea
              placeholder="Share your thoughts about the thumbnails..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>

          <div>
            <p className="text-sm font-medium">What aspects are most important to you?</p>
            <div className="grid grid-cols-2 gap-2">
              {["Visual Design", "Message Clarity", "Engagement Potential", "Brand Consistency"].map(
                (aspect) => (
                  <label
                    key={aspect}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <Checkbox
                      checked={aspects.includes(aspect)}
                      onCheckedChange={() => handleAspectToggle(aspect)}
                    />
                    <span>{aspect}</span>
                  </label>
                )
              )}
            </div>
          </div>
        </div>

         <DialogFooter>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit Feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
