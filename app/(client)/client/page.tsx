import { redirect } from "next/navigation";

export default function ClientIndexRedirect() {
    redirect("/client/dashboard");
}
