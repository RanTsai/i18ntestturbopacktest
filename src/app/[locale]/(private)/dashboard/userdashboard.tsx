  // components/dashboard/Dashboard.tsx
  "use server";

  import { mockDashboard } from "./mockdata";
  import Image from "next/image";
  import React from "react";
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import MyWorkSection from "./my-work-section";
import { loadAllUserWork } from '@/actions/upstashredis/load-userwork';

  export default async function UserDashboard() {
     const response = await loadAllUserWork();
     
    
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
        <MyWorkSection userWorks={response.content ?? []} />
       
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