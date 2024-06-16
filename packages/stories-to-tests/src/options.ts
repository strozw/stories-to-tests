import * as v from "valibot";

export const optionsSchema = v.intersect([
  v.object({
    config: v.string(),
    outputDir: v.string(),
    watch: v.boolean(),
  }),
  v.union([
    v.object({
      templateType: v.picklist(["vitest-react", "playwright-react"]),
      templateDir: v.undefined_(),
    }),
    v.object({
      templateType: v.undefined_(),
      templateDir: v.string(),
    }),
  ]),
]);

export type ParsedOptions = v.InferOutput<typeof optionsSchema>;

export const parseOptions = (raw: unknown) => v.safeParse(optionsSchema, raw);

export type ParseResultIssues = Exclude<
  ReturnType<typeof parseOptions>["issues"],
  undefined
>;
