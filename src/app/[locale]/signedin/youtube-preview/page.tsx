// app/[locale]/(private)/new/youtube-preview/page.tsx  ← 沒有 "use client"
import DevicePreviewClient from "./youtube-view-client"; // 新增一個 client component

export default async function Page() {

  return <DevicePreviewClient  />;
}
