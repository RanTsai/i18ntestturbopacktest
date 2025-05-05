import {useTranslations} from 'next-intl';
 
export default function HomePage() {
  const t = useTranslations();
  return (
    <div>
      <h1>dashboard</h1>      
    </div>
  );
}