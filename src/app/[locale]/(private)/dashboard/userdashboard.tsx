// components/dashboard/Dashboard.tsx
"use server";

import { mockDashboard } from "./mockdata";
import Image from "next/image";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadAllUserWork } from "@/actions/upstashredis/load-userwork";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
//import { Eye, Star, View } from "lucide-react";
import Link from 'next/link';

dayjs.extend(relativeTime);

export default async function UserDashboard() {
  const { content: userWorks, from } = await loadAllUserWork();
  let verifiedWork = null;
  console.log("loaded userwork", userWorks, from,);
  if (userWorks) {
    verifiedWork = userWorks;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* Section: Create Your Thumbnail */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create Your Thumbnail</h2>
          <Button variant="default" size="sm" className="outline cursor-pointer transition-colors hover:bg-blue-600 hover:text-white">Tutorial</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {mockDashboard.createOptions.map((option) => (
            <Card key={option.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Image
                  src={option.img_url}
                  alt={option.title}
                  width={500}
                  height={300}
                  className="rounded-md w-full h-40 object-cover"
                />
              </CardHeader>
              <CardContent className="space-y-2">
                <CardTitle>{option.title}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
                <Button className="w-full mt-2 cursor-pointer bg-blue-500" variant="default">{option.buttonText}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Section: My Thumbnails */}
      <section className="space-y-2">
        <h2 className="text-2xl font-bold">My Work</h2>
        {userWorks === null ? (
          <p className="text-muted-foreground">You haven’t created any thumbnail project yet. Create your first project above!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 cursor-pointer">
            {userWorks!.map((work) => (
              <Card key={work.user_work_id} className="relative group overflow-hidden p-0 shadow-md">
                <div className="relative">
                  <Link href={`/aichat/${work.public_id}`}>
                    <Image
                      src={work.image_url}
                      alt={work.title}
                      width={400}
                      height={300}
                      className="w-full h-40 object-cover"
                    />
                  </Link>
                  {/* Hover Button */}
                  <Button
                    variant="default"
                    className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    AI Review
                  </Button>

                  {/* Overlay View & Rating Count */}
                  {/* <div className="absolute bottom-2 left-2 flex items-center gap-3 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-white" />
                      <span>{work.view_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>{work.rating_count}</span>
                    </div>
                  </div> */}

                  {/* Version label */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    V{work.versions?.version_number ?? '—'}
                  </div>
                </div>

                {/* 卡片下方文字內容 */}
                <CardContent className="p-2 space-y-1">
                  <CardTitle>{work.title}</CardTitle>
                  <CardDescription>{work.description}</CardDescription>
                  <CardDescription>created {dayjs(work.created_at).fromNow()}</CardDescription>
                </CardContent>
              </Card>

            ))}
          </div>
        )}
      </section>

      {/* Section: Thumbnail Library */}
      <section className="space-y-2">
        <h2 className="text-2xl font-bold">My thumbnails</h2>
        <p className="text-muted-foreground">Your Work Assets</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 cursor-pointer">
          {mockDashboard.ThumbnailLibrary.map((char) => (
            <Card key={char.id}>
              <CardContent>
                <Image
                  src={char.image}
                  alt={char.name}
                  width={400}
                  height={300}
                  className="w-full h-40 object-cover rounded"
                />
                <div className="pt-2">
                  <p className="font-semibold text-lg truncate" title={char.name}>{char.name}</p>
                  <p className="text-sm text-muted-foreground">By {char.author}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}