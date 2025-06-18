import {
  thumbnailOptions,
  radarData,
  aiAnalysis,
  teamVotes,
  summary,
  learnings,
} from "./mockanalysis";
import Radarchart from "@/components/ui/review/radarchart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ThumbnailDecisionReport() {
  return (
    <div className="bg-white p-6 max-w-5xl mx-auto space-y-6 rounded-md shadow">
      {/* Cover Comparison */}
      <div className="grid grid-cols-3 gap-4">
        {thumbnailOptions.map((thumb) => (
          <div key={thumb.id} className="text-center space-y-2">
            <img src={thumb.imageUrl} className="w-full h-auto rounded" />
            <p className="font-semibold">{thumb.title}</p>
            <p className="text-sm text-gray-500">Core design: {thumb.coreDesign}</p>
          </div>
        ))}
      </div>

      {/* Radar + Analysis */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="w-full lg:w-1/2">
          {/* Replace with actual chart */}
          <div className="h-60 bg-gray-100 flex items-center justify-center text-gray-400 rounded">
            
            <Radarchart data={[radarData["A"].clarity, radarData["A"].branding, radarData["A"].stoppingPower, 4.8, 3.5]} />
          </div>
        </div>
        <div className="w-full lg:w-1/2 space-y-2">
          <p className="font-medium">AI Analysis</p>
          <ul className="text-sm space-y-1">
            {Object.entries(aiAnalysis).map(([id, result]) => (
              <li key={id}>
                <span className={`font-semibold ${result === "recommended" ? "text-blue-600" : "text-gray-400"}`}>
                  Cover {id}
                </span>{" "}
                - {result === "recommended" ? "Recommended" : "Not recommended"}
              </li>
            ))}
          </ul>
        </div>
      </div>

     {/* Team Poll */}
<div>
  <p className="font-medium mb-2">Team Poll</p>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {teamVotes.map((vote, i) => (
      <div key={i} className="bg-gray-50 rounded p-3 shadow text-sm flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={"/logo/logo.png"} alt={vote.name} />
          <AvatarFallback>{vote.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{vote.name} voted Cover {vote.voted}</p>
          <p className="text-gray-600">{vote.comment}</p>
        </div>
      </div>
    ))}
  </div>
</div>

      {/* Summary */}
      <div className="space-y-1">
        <p className="font-medium">Summary</p>
        <p className="text-blue-600 font-semibold">✔ Final cover: Cover {summary.final}</p>
        <p>{summary.reason}</p>
      </div>

      {/* Learnings */}
      <div className="space-y-1">
        <p className="font-medium">Learnings</p>
        <ul className="list-disc list-inside text-sm text-gray-600">
          {learnings.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </div>

      {/* Download */}
      <div>
        <button className="mt-4 text-sm text-blue-600 hover:underline">⬇ Download analysis (PDF)</button>
      </div>
    </div>
  );
}
