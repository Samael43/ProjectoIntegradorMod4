from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta
from .serializers import UserSerializer, CategorySerializer, TaskSerializer
from .models import User, Category, Task
from rest_framework.generics import ListAPIView

class RefreshTokenView(APIView):
    permission_classes = []  # No authentication required

    def post(self, request):
        refresh_token = request.data.get("refreshToken")

        if not refresh_token:
            return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Decode and validate the refresh token
            refresh = RefreshToken(refresh_token)
            # Create a new access token
            access_token = str(refresh.access_token)
            return Response({"accessToken": access_token}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Invalid or expired refresh token"}, status=status.HTTP_401_UNAUTHORIZED)


@extend_schema(
    tags=["User"],
    description="Create a new user account",
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "email": {"type": "string", "format": "email"},
                "password": {"type": "string", "format": "password"},
                "full_name": {"type": "string"},
                "profile_picture": {"type": "string", "nullable": True},
            },
            "required": ["email", "password"],
        }
    },
    responses={
        201: UserSerializer,
        400: {"type": "object", "properties": {"error": {"type": "string"}}},
    },
)
class CreateUserView(APIView):
    permission_classes = [
        AllowAny
    ]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            # Use create_user instead of save() to properly hash the password
            user = User.objects.create_user(
                email=serializer.validated_data["email"],
                password=serializer.validated_data["password"],
                full_name=serializer.validated_data.get("full_name", ""),
            )
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=["Authentication"],
    description="Login with email and password",
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "email": {"type": "string", "format": "email"},
                "password": {"type": "string", "format": "password"},
            },
            "required": ["email", "password"],
        }
    },
    responses={
        200: {
            "type": "object",
            "properties": {
                "message": {"type": "string"},
                "tokens": {
                    "type": "object",
                    "properties": {
                        "access": {"type": "string"},
                        "refresh": {"type": "string"},
                    },
                },
                "user": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "integer"},
                        "email": {"type": "string"},
                        "full_name": {"type": "string"},
                    },
                },
            },
        },
        400: {"type": "object", "properties": {"error": {"type": "string"}}},
    },
)
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        user = authenticate(username=email, password=password)

        if user:
            # Generate token
            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "message": "Login successful",
                    "tokens": {
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                    },
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "full_name": user.full_name,
                    },
                }
            )

        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST
        )


@extend_schema(
    tags=["Authentication"],
    description="Logout current user",
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'refresh_token': {'type': 'string', 'description': 'Refresh token to blacklist'}
            },
            'required': ['refresh_token']
        }
    },
    responses={
        200: {
            "type": "object",
            "properties": {
                "message": {"type": "string"}
            }
        },
        400: {
            "type": "object",
            "properties": {
                "error": {"type": "string"}
            }
        }
    },
)
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out successfully"})
        except Exception as e:
            return Response(
                {"error": "Invalid token"},
                status=status.HTTP_400_BAD_REQUEST
            )
@extend_schema(
    tags=["Authentication"],
    description="Send password reset link to email",
    request={
        "application/json": {
            "type": "object",
            "properties": {"email": {"type": "string", "format": "email"}},
            "required": ["email"],
        }
    },
    responses={
        200: {"type": "object", "properties": {"message": {"type": "string"}}},
        500: {"type": "object", "properties": {"error": {"type": "string"}}},
    },
)
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        try:
            user = User.objects.get(email=email)

            # Generate reset token
            reset_token = get_random_string(64)

            # Set token expiry to 24 hours from now
            token_expiry = timezone.now() + timedelta(days=1)

            # Save token and expiry to user
            user.reset_token = reset_token
            user.reset_token_expiry = token_expiry
            user.save()

            # Create reset link
            reset_link = (
                f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
            )

            # Email subject and message
            subject = "Password Reset Request"
            message = f"""
            Hello,

            You have requested to reset your password. Please click the link below to reset your password:

            {reset_link}

            This link will expire in 24 hours.

            If you didn't request this, please ignore this email.

            Best regards,
            Your Application Team
            """

            try:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[email],
                    fail_silently=False,
                )
                return Response(
                    {"message": "Password reset link has been sent to your email"},
                    status=status.HTTP_200_OK,
                )

            except Exception as e:
                return Response(
                    {"error": "Failed to send email. Please try again later."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        except User.DoesNotExist:
            # Return success even if email doesn't exist for security
            return Response(
                {
                    "message": "If this email exists in our system, a password reset link has been sent"
                },
                status=status.HTTP_200_OK,
            )


@extend_schema(
    tags=["Authentication"],
    description="Reset password using token",
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "token": {"type": "string"},
                "new_password": {"type": "string", "format": "password"},
            },
            "required": ["token", "new_password"],
        }
    },
    responses={
        200: {"type": "object", "properties": {"message": {"type": "string"}}},
        400: {"type": "object", "properties": {"error": {"type": "string"}}},
    },
)
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        try:
            user = User.objects.get(
                reset_token=token, reset_token_expiry__gt=timezone.now()
            )

            # Set new password
            user.set_password(new_password)

            # Clear reset token and expiry
            user.reset_token = None
            user.reset_token_expiry = None
            user.save()

            return Response(
                {"message": "Password has been reset successfully"},
                status=status.HTTP_200_OK,
            )

        except User.DoesNotExist:
            return Response(
                {"error": "Invalid or expired reset token"},
                status=status.HTTP_400_BAD_REQUEST,
            )



@extend_schema(
    tags=["User"],
    description="Change user password",
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "currentPassword": {"type": "string", "format": "password"},
                "newPassword": {"type": "string", "format": "password"},
            },
            "required": ["currentPassword", "newPassword"],
        }
    },
    responses={200: {"type": "object", "properties": {"message": {"type": "string"}}}},
)
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get("currentPassword")
        new_password = request.data.get("newPassword")

        # Check if the current password matches
        if not user.check_password(current_password):
            return Response({"error": "Current password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)

        # Update to the new password
        user.set_password(new_password)
        user.save()

        return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)

@extend_schema(
    tags=["User"],
    description="Update user profile information",
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "full_name": {"type": "string"},
                "profile_picture": {"type": "string", "nullable": True},
            },
        }
    },
    responses={
        200: UserSerializer,
        400: {"type": "object", "properties": {"error": {"type": "string"}}},
    },
)
class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=["Category"],
    description="Create a new category",
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "description": {"type": "string", "nullable": True},
            },
            "required": ["name"],
        }
    },
    responses={
        201: CategorySerializer,
        400: {"type": "object", "properties": {"error": {"type": "string"}}},
    },
)

class CategoryCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            # Set the author as the current logged-in user
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=["Category"],
    description="Edit an existing category",
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "name": {"type": "string"},
                "description": {"type": "string", "nullable": True},
            },
            "required": ["id"],
        }
    },
    responses={
        200: CategorySerializer,
        404: {"type": "object", "properties": {"error": {"type": "string"}}},
    },
)

class CategoryEditView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Only allow editing if the user is the author
            category = Category.objects.get(
                id=request.data.get("id"), author=request.user
            )
            serializer = CategorySerializer(category, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Category.DoesNotExist:
            return Response(
                {"error": "Category not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND,
            )


@extend_schema(
    tags=["Category"],
    description="Get a single category by ID",
    responses={
        200: CategorySerializer,
        404: {"type": "object", "properties": {"error": {"type": "string"}}},
    },
)
class CategoryDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, category_id):
        try:
            category = Category.objects.get(id=category_id, author=request.user)
            return Response(CategorySerializer(category).data)
        except Category.DoesNotExist:
            return Response(
                {"error": "Category not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND,
            )


@extend_schema(
    tags=["Category"],
    description="Get all tasks for a category",
    responses={
        200: TaskSerializer(many=True),
        404: {"type": "object", "properties": {"error": {"type": "string"}}},
    },
)

class CategoryTasksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, category_id):
        try:
            category = Category.objects.get(id=category_id, author=request.user)
            tasks = Task.objects.filter(category=category, author=request.user)
            return Response(TaskSerializer(tasks, many=True).data)
        except Category.DoesNotExist:
            return Response(
                {"error": "Category not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND,
            )

@extend_schema(
    tags=["Category"],
    description="Retrieve all categories for the authenticated user",
    responses={
        200: CategorySerializer(many=True),
        401: {"type": "object", "properties": {"detail": {"type": "string"}}},
    },
)
class CategoryListView(ListAPIView):
    serializer_class = CategorySerializer  # Define the serializer
    permission_classes = [IsAuthenticated]  # Enforce authentication

    def get_queryset(self):
        """
        Return only the categories belonging to the authenticated user.
        """
        return Category.objects.filter(author=self.request.user)  # Filter by user

@extend_schema(
    tags=["Category"],
    description="Delete a category",
    request={
        "application/json": {
            "type": "object",
            "properties": {"id": {"type": "integer"}},
            "required": ["id"],
        }
    },
    responses={
        204: None,
        404: {"type": "object", "properties": {"error": {"type": "string"}}},
    },
)
class CategoryDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Only allow deletion if the user is the author
            category = Category.objects.get(
                id=request.data.get("id"), author=request.user
            )
            category.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Category.DoesNotExist:
            return Response(
                {"error": "Category not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND,
            )

@extend_schema(
    tags=["Task"],
    description="Create a new task",
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "title": {"type": "string"},  # Add title field
                "description": {"type": "string"},
                "due_date": {"type": "string", "format": "date"},
                "priority": {"type": "string", "enum": ["low", "medium", "high"]},
                "status": {
                    "type": "string",
                    "enum": ["pending", "inprogress", "completed"],
                },
                "category_id": {"type": "integer"},
            },
            "required": ["title", "description", "due_date", "priority", "category_id"],  # Add title to required fields
        }
    },
    responses={
        201: TaskSerializer,
        400: {"type": "object", "properties": {"error": {"type": "string"}}},
    },
)
class TaskCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=["Task"],
    description="Edit an existing task",
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "title": {"type": "string"},  # Add title field
                "description": {"type": "string"},
                "due_date": {"type": "string", "format": "date"},
                "priority": {"type": "string", "enum": ["low", "medium", "high"]},
                "status": {
                    "type": "string",
                    "enum": ["pending", "inprogress", "completed"],
                },
                "category_id": {"type": "integer"},
            },
            "required": ["id"],
        }
    },
    responses={
        200: TaskSerializer,
        404: {"type": "object", "properties": {"error": {"type": "string"}}},
    },
)

class TaskEditView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            task = Task.objects.get(id=request.data.get("id"))

            # Check if the authenticated user is the author of the task
            if task.author != request.user:
                return Response(
                    {"error": "You are not authorized to edit this task."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Proceed with task update
            serializer = TaskSerializer(task, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Task.DoesNotExist:
            return Response(
                {"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND
            )


@extend_schema(
    tags=["Task"],
    description="Delete a task",
    request={
        "application/json": {
            "type": "object",
            "properties": {"id": {"type": "integer"}},
            "required": ["id"],
        }
    },
    responses={
        204: None,
        404: {"type": "object", "properties": {"error": {"type": "string"}}},
    },
)

class TaskDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            task = Task.objects.get(id=request.data.get("id"))
            task.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Task.DoesNotExist:
            return Response(
                {"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND
            )


@extend_schema(
    tags=["Task"],
    description="Retrieve a single task by ID (user-specific)",
    request=None,  # No request body is needed
    responses={
        200: {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "title": {"type": "string"},
                "description": {"type": "string"},
                "due_date": {"type": "string", "format": "date"},
                "priority": {"type": "string", "enum": ["low", "medium", "high"]},
                "status": {"type": "string", "enum": ["pending", "in_progress", "completed"]},
                "category_id": {"type": "integer"},
                "created_at": {"type": "string", "format": "date-time"},
                "updated_at": {"type": "string", "format": "date-time"},
            },
        },
        404: {"type": "object", "properties": {"error": {"type": "string"}}},
        403: {"type": "object", "properties": {"error": {"type": "string"}}},
    },
)

class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            task = Task.objects.get(id=id)
            
            # Check if the task belongs to the authenticated user
            if task.author != request.user:
                return Response(
                    {"error": "You do not have permission to view this task"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            task_data = {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "due_date": task.due_date,  # assuming `due_date` is a DateField in the model
                "priority": task.priority,  # assuming `priority` is a string field with values like 'low', 'medium', 'high'
                "status": task.status,  # assuming `status` is a string field with values like 'pending', 'in_progress', 'completed'
                "category_id": task.category_id,  # assuming this is an integer field referring to a category
                "created_at": task.created_at,
                "updated_at": task.updated_at,
            }

            return Response(task_data, status=status.HTTP_200_OK)
        
        except Task.DoesNotExist:
            return Response(
                {"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND
            )
        
     

@extend_schema(
    tags=["Task"],
    description="Search tasks based on title, description, priority, etc. (user-specific)",
    parameters=[
        {
            "name": "search",
            "in": "query",
            "required": False,
            "schema": {
                "type": "string",
                "description": "Search term to filter tasks by title (case-insensitive)"
            }
        }
    ],
    responses={
        200: {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "due_date": {"type": "string", "format": "date"},
                    "priority": {"type": "string", "enum": ["low", "medium", "high"]},
                    "status": {"type": "string", "enum": ["pending", "in_progress", "completed"]},
                    "category_id": {"type": "integer"},
                    "created_at": {"type": "string", "format": "date-time"},
                    "updated_at": {"type": "string", "format": "date-time"},
                },
            },
        },
        404: {"type": "object", "properties": {"error": {"type": "string"}}},
        403: {"type": "object", "properties": {"error": {"type": "string"}}},
    },
)

class TaskSearchView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def get(self, request, search_term):
        # Filter tasks by the logged-in user and search term
        tasks = Task.objects.filter(
            author=request.user,  # Only return tasks for the authenticated user
            title__icontains=search_term  # Search in the 'title' field
        )

        # If you want to search in other fields like 'description' or 'category', you can expand the filter
        # tasks = Task.objects.filter(
        #     author=request.user,
        #     title__icontains=search_term
        # ) | Task.objects.filter(
        #     author=request.user,
        #     description__icontains=search_term
        # )

        serializer = TaskSerializer(tasks, many=True)  # Serialize the filtered tasks
        return Response(serializer.data, status=status.HTTP_200_OK)
