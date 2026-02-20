from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.response import Response

from .models import Task
from .serializers import TaskSerializer, TaskToggleSerializer


class TaskViewSet(viewsets.ViewSet):

    def list(self, request):
        queryset = Task.objects.all().order_by("-created_at")
        serializer = TaskSerializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = TaskSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = serializer.save()
        return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        task = get_object_or_404(Task, pk=pk)
        return Response(TaskSerializer(task).data)

    def update(self, request, pk=None):
        task = get_object_or_404(Task, pk=pk)
        serializer = TaskSerializer(task, data=request.data)
        serializer.is_valid(raise_exception=True)
        task = serializer.save()
        return Response(TaskSerializer(task).data)

    def partial_update(self, request, pk=None):
        task = get_object_or_404(Task, pk=pk)
        serializer = TaskToggleSerializer(task, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        if "completed" not in serializer.validated_data:
            return Response(
                {"detail": "Must provide 'completed' when patching."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        task.completed = serializer.validated_data["completed"]
        task.save(update_fields=["completed"])
        return Response(TaskToggleSerializer(task).data)

    def destroy(self, request, pk=None):
        task = get_object_or_404(Task, pk=pk)
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
