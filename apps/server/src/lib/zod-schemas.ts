import { z } from "zod";

export const serviceTypeSchema = z.enum(["escort", "companion"]);
