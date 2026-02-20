import { useEffect, useMemo, useState } from "react"
import { AxiosError } from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { taskApi } from "@/api/tasks"
import type { Task } from "@/types/task"
import {
  taskFormDefaults,
  taskFormSchema,
  type TaskFormValues,
} from "@/validation/task-form"

const readApiMessage = (fallback: string, error: unknown) => {
  if (!(error instanceof AxiosError)) {
    return fallback
  }

  const payload = error.response?.data
  if (typeof payload === "string") {
    return payload
  }

  if (payload && typeof payload === "object") {
    const detail = (payload as { detail?: unknown }).detail
    if (typeof detail === "string") {
      return detail
    }
  }

  return fallback
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [pendingTaskId, setPendingTaskId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: taskFormDefaults,
  })

  const editForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: taskFormDefaults,
  })

  const hasTasks = tasks.length > 0
  const completedCount = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  )

  useEffect(() => {
    void fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await taskApi.list()
      setTasks(data)
    } catch (requestError) {
      setError(
        readApiMessage(
          "Could not load tasks. Make sure the backend server is running.",
          requestError
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = createForm.handleSubmit(async (values) => {
    setIsCreating(true)
    setError(null)

    try {
      const createdTask = await taskApi.create(values)
      setTasks((prev) => [createdTask, ...prev])
      createForm.reset(taskFormDefaults)
    } catch (requestError) {
      setError(readApiMessage("Could not create the task.", requestError))
    } finally {
      setIsCreating(false)
    }
  })

  const openEditDialog = (task: Task) => {
    setEditingTask(task)
    editForm.reset({
      title: task.title,
      description: task.description ?? "",
    })
    setError(null)
    setIsEditOpen(true)
  }

  const handleEditSubmit = editForm.handleSubmit(async (values) => {
    if (!editingTask) {
      return
    }

    setIsSavingEdit(true)
    setError(null)

    try {
      const updatedTask = await taskApi.update(
        editingTask.id,
        editingTask.completed,
        values
      )

      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      )

      setIsEditOpen(false)
      setEditingTask(null)
      editForm.reset(taskFormDefaults)
    } catch (requestError) {
      setError(readApiMessage("Could not update the task.", requestError))
    } finally {
      setIsSavingEdit(false)
    }
  })

  const handleToggleComplete = async (task: Task) => {
    setPendingTaskId(task.id)
    setError(null)

    try {
      const updatedTask = await taskApi.toggleCompleted(task.id, !task.completed)
      setTasks((prev) =>
        prev.map((item) =>
          item.id === task.id
            ? {
                ...item,
                completed: updatedTask.completed,
              }
            : item
        )
      )
    } catch (requestError) {
      setError(
        readApiMessage("Could not update completion status.", requestError)
      )
    } finally {
      setPendingTaskId(null)
    }
  }

  const handleDelete = async (taskId: number) => {
    setPendingTaskId(taskId)
    setError(null)

    try {
      await taskApi.remove(taskId)
      setTasks((prev) => prev.filter((task) => task.id !== taskId))
    } catch (requestError) {
      setError(readApiMessage("Could not delete the task.", requestError))
    } finally {
      setPendingTaskId(null)
    }
  }

  return (
    <main className="relative isolate mx-auto min-h-screen w-full max-w-4xl px-4 py-10 md:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-primary/10 absolute top-10 left-[-4rem] h-52 w-52 rounded-full blur-3xl" />
        <div className="bg-chart-2/15 absolute right-[-5rem] bottom-20 h-64 w-64 rounded-full blur-3xl" />
      </div>
      <section className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Task Manager</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {completedCount} of {tasks.length} tasks completed
        </p>
      </section>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create Task</CardTitle>
          <CardDescription>
            Add a new task with a title and optional description.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4" noValidate>
            <div className="space-y-1">
              <Input
                {...createForm.register("title")}
                placeholder="Title"
                disabled={isCreating}
              />
              {createForm.formState.errors.title && (
                <p className="text-destructive text-xs">
                  {createForm.formState.errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Textarea
                {...createForm.register("description")}
                placeholder="Description (optional)"
                disabled={isCreating}
              />
              {createForm.formState.errors.description && (
                <p className="text-destructive text-xs">
                  {createForm.formState.errors.description.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Task"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-4">
        {isLoading && (
          <Card>
            <CardContent className="py-6 text-sm">Loading tasks...</CardContent>
          </Card>
        )}

        {!isLoading && !hasTasks && (
          <Card>
            <CardContent className="py-6 text-sm">
              No tasks yet. Create your first task above.
            </CardContent>
          </Card>
        )}

        {!isLoading &&
          hasTasks &&
          tasks.map((task) => {
            const isPending = pendingTaskId === task.id

            return (
              <Card key={task.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle
                        className={task.completed ? "line-through opacity-70" : ""}
                      >
                        {task.title}
                      </CardTitle>
                      <CardDescription className="mt-2 whitespace-pre-wrap">
                        {task.description || "No description"}
                      </CardDescription>
                    </div>
                    <Badge variant={task.completed ? "secondary" : "default"}>
                      {task.completed ? "Completed" : "Open"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    disabled={isPending}
                    onClick={() => handleToggleComplete(task)}
                  >
                    {isPending
                      ? "Updating..."
                      : task.completed
                        ? "Mark as Open"
                        : "Mark as Completed"}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={isPending}
                    onClick={() => openEditDialog(task)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={isPending}
                    onClick={() => handleDelete(task.id)}
                  >
                    {isPending ? "Deleting..." : "Delete"}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
      </section>

      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open)
          if (!open) {
            setEditingTask(null)
            editForm.reset(taskFormDefaults)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the title and description for this task.
            </DialogDescription>
          </DialogHeader>

          <form
            id="edit-task-form"
            onSubmit={handleEditSubmit}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1">
              <Input
                {...editForm.register("title")}
                placeholder="Title"
                disabled={isSavingEdit}
              />
              {editForm.formState.errors.title && (
                <p className="text-destructive text-xs">
                  {editForm.formState.errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Textarea
                {...editForm.register("description")}
                placeholder="Description"
                disabled={isSavingEdit}
              />
              {editForm.formState.errors.description && (
                <p className="text-destructive text-xs">
                  {editForm.formState.errors.description.message}
                </p>
              )}
            </div>
          </form>

          <DialogFooter showCloseButton>
            <Button type="submit" form="edit-task-form" disabled={isSavingEdit}>
              {isSavingEdit ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

export default App
