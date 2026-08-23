import LoginPageClient from "./LoginPageClient";
import { resolveSafeNextHref } from "./redirect";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return <LoginPageClient safeNextHref={resolveSafeNextHref(params.next)} />;
}
