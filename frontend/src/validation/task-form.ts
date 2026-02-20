import { z } from "zod"

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z.string(),
})

export type TaskFormValues = z.infer<typeof taskFormSchema>

export const taskFormDefaults: TaskFormValues = {
  title: "",
  description: "",
}
