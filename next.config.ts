import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const nextConfig: NextConfig = {
   images: {
    domains: ['ijuyminrnhiekoxybhgm.supabase.co'], // ✅ 加入你的 Supabase domain
    },
     experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};
 
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

