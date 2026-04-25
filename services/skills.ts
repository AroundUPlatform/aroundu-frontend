import { http } from "./http";
import type { Skill } from "../types/job";

export const suggestSkills = async (query: string) => {
    return http<Skill[]>("/skills/suggest", { query: { q: query } });
};
