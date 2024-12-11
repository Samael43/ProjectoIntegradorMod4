from django.db import models
from django.contrib.auth.models import AbstractUser


# tasks/models.py
from django.contrib.auth.base_user import BaseUserManager


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None  # Remove username field
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=100, blank=True, null=True)
    profile_picture = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(
        max_length=8,
        choices=[("active", "active"), ("inactive", "inactive"), ("banned", "banned")],
        default="active",
    )
    reset_token = models.CharField(max_length=255, blank=True, null=True)
    reset_token_expiry = models.DateTimeField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    class Meta:
        db_table = "users"


class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "categories"


class Task(models.Model):
    title = models.CharField(max_length=1024)
    description = models.TextField(null=True,blank=True)
    due_date = models.DateField(null=True, blank=True)
    priority = models.CharField(
        max_length=6, choices=[("low", "low"), ("medium", "medium"), ("high", "high")]
    )
    status = models.CharField(
        max_length=10,
        choices=[
            ("pending", "pending"), 
            ("inprogress", "inprogress"),
            ("completed", "completed"),
        ],
        default="pending",
    )
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "tasks"
