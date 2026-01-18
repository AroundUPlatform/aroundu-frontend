import { redirect } from "next/navigation";

export default function WorkerIndexRedirect() {
    redirect("/worker/dashboard");
}
