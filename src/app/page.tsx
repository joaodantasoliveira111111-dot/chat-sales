import { ChatLanding } from "@/components/chat/ChatLanding";
import { getPublicProduct } from "@/lib/data/store";

export default async function Home() {
  const payload = await getPublicProduct("capcut-pro");
  return <ChatLanding {...payload} />;
}
