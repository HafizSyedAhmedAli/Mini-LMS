import { route } from "@/shared/api/http";
import { getDashboard } from "@/widgets/dashboard-stats/server";

export const GET = route(async () => getDashboard());
