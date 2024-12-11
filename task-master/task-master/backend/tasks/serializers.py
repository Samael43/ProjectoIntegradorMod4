from rest_framework import serializers
from .models import User, Category, Task


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "password",
            "full_name",
            "profile_picture",
            "status",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "password": {"write_only": True},
            "reset_token": {"write_only": True},
            "reset_token_expiry": {"write_only": True},
        }


class CategorySerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "description", "author"]
        read_only_fields = (
            "author",
        )  # Make author read-only as it will be set automatically


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "due_date",
            "priority",
            "status",
            "category",
            "author",
        ]
