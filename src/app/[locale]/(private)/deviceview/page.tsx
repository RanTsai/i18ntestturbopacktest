import React from 'react'
import DeviceView from '@/components/ui/review/device-view';
import DevicePreviewList from '@/components/ui/review/device-preview-list';

function page() {
    const imageUrl="/thumbnail.png";
    const title = "titlte 1";

  return (
    <div>
        {/* <DeviceView image={imageUrl} title={title} /> */}
        <DevicePreviewList image="/thumbnail.png" />
    </div>
  )
}

export default page