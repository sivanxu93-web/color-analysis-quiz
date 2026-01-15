import PageComponent from "./PageComponent";
import { getColorLabText } from '~/i18n/languageText';

export default async function ProfilePage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const colorLabText = await getColorLabText();
  return (
    <PageComponent locale={locale} colorLabText={colorLabText} />
  )
}
