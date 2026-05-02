import { ChatLanding } from "@/components/chat/ChatLanding";
import { getPublicProduct } from "@/lib/data/store";

export default async function PublicProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const payload = await getPublicProduct(slug);
  return <ChatLanding {...payload} />;
}
