from django.db import models


class Task(models.Model):
    title: models.CharField = models.CharField(max_length=255)
    description: models.TextField = models.TextField(blank=True, null=True)
    completed: models.BooleanField = models.BooleanField(default=False)
    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.title
