import { apiClient } from "@/api/client"
import type { Task } from "@/types/task"

export type TaskFormInput = {
  title: string
  description: string
}

const normalizePayload = (payload: TaskFormInput) => ({
  title: payload.title.trim(),
  description: payload.description.trim() || null,
})

export const taskApi = {
  async list() {
    const { data } = await apiClient.get<Task[]>("/tasks/")
    return data
  },

  async create(payload: TaskFormInput) {
    const { data } = await apiClient.post<Task>("/tasks/", normalizePayload(payload))
    return data
  },

  async update(taskId: number, completed: boolean, payload: TaskFormInput) {
    const { data } = await apiClient.put<Task>(`/tasks/${taskId}/`, {
      ...normalizePayload(payload),
      completed,
    })
    return data
  },

  async toggleCompleted(taskId: number, completed: boolean) {
    const { data } = await apiClient.patch<Pick<Task, "id" | "completed">>(
      `/tasks/${taskId}/`,
      { completed }
    )
    return data
  },

  async remove(taskId: number) {
    await apiClient.delete(`/tasks/${taskId}/`)
  },
}
