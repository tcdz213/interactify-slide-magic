
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';

const HeaderSection = () => {
  const { t } = useTranslation();
  
  return <Header />;
};

export default HeaderSection;
