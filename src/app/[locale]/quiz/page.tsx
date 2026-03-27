import PageComponent from "./PageComponent";

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  return <PageComponent locale={locale} />;
}
