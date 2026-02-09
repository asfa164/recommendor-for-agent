import { z } from "zod";

export const TurnMatchingSchema = z
  .object({
    scope: z.enum(["any", "recent", "current"]).optional(),
    evaluationStrategy: z.enum(["first_match", "best_match", "latest_match"]).optional(),
    recentTurnCount: z.number().int().positive().optional()
  })
  .optional();

export const SubObjectiveSchema = z.object({
  description: z.string().min(1),
  isBlocking: z.boolean().optional(),
  instructions: z.string().optional(),
  satisfactionCriteria: z.array(z.string().min(1)).optional(),
  maxTurnsForObjective: z.number().int().positive().optional(),
  turnMatching: TurnMatchingSchema
});

export const CompositeObjectiveSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  persona: z.string().min(1),
  userVariables: z.record(z.string()).optional(),
  subObjectives: z.array(SubObjectiveSchema).min(1)
});

export type CompositeObjectiveInput = z.infer<typeof CompositeObjectiveSchema>;
