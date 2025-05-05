import {useTranslations} from 'next-intl';
 
export default function HomePage() {
  const t = useTranslations();
  return (
    <div>
      <h1>{t('greeting')}</h1>      
    </div>
  );
}