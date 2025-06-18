export const mockDashboard = {
  createOptions: [
    {
      id: "start_4_images",
      title: "Start with 4+ Images",
      img_url: "/thumbnail1.png",
      description: "Upload 4 or more images to create your Thumbnail.",
      buttonText: "Start with 4+ Images",
      icon: "image-stack",
    },
    {
      id: "start_1_image",
      title: "Start with One Image",
      img_url: "/thumbnail2.png",
      description: "Upload a single image to get started quickly.",
      buttonText: "Start with One Image",
      icon: "single-image",
    },
    {
      id: "start_description",
      title: "Start with Description",
      img_url: "/thumbnail3.png",
      description: "Describe your Thumbnail using text.",
      buttonText: "Start with Description",
      icon: "text",
    },
  ],
  myThumbnails: [
    {
      id: "tung_tung",
      name: "Tung Tung Tung Sahur",
      author: "OpenArt",
      image: "/short1.png",
    }
  ],
  ThumbnailLibrary: [
    {
      id: "tung_tung",
      name: "Tung Tung Tung Sahur",
      author: "OpenArt",
      image: "/short1.png",
    },
    {
      id: "tralalero",
      name: "Tralalero Tralala",
      author: "OpenArt",
      image: "/short2.png",
    },
    {
      id: "bombombini",
      name: "Bombombini Gusini",
      author: "OpenArt",
      image: "/short3.png",
    },
    {
      id: "patapim",
      name: "Brr Brr Patapim",
      author: "OpenArt",
      image: "/short4.png",
    },
    {
      id: "trippi",
      name: "Trippi Troppi",
      author: "OpenArt",
      image: "/short2.png",
    },
    {
      id: "elephant",
      name: "Mister Elephant",
      author: "OpenArt",
      image: "/short2.png",
    },
    {
      id: "monkey",
      name: "Banana Monkey",
      author: "OpenArt",
      image: "/short2.png",
    },
    {
      id: "dragon",
      name: "Skyfire Dragon",
      author: "OpenArt",
      image: "/short2.png",
    },
    {
      id: "ballerina",
      name: "Tiny Ballerina",
      author: "OpenArt",
      image: "/short2.png",
    },
    {
      id: "robot",
      name: "Neon Robot",
      author: "OpenArt",
      image: "/short2.png",
    },
  ],
};



export interface ThumbnailOption {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  icon: string;
}

export interface Thumbnail {
  id: string;
  name: string;
  author: string;
  image: string;
}

export interface MockThumbnails {
  createOptions: ThumbnailOption[];
  myThumbnails: Thumbnail[];
  ThumbnailLibrary: Thumbnail[];
}