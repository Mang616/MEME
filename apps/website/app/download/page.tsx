import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/site";

export default function DownloadPage() {
  redirect(`${ROUTES.order}#install`);
}
