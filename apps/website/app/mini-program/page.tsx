import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/site";

export default function MiniProgramPage() {
  redirect(`${ROUTES.order}#wechat`);
}
