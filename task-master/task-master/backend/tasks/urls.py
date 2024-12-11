from django.urls import path
from . import views
from .views import RefreshTokenView

urlpatterns = [
    # User endpoints
    path("user/create", views.CreateUserView.as_view()),
    path("user/login", views.LoginView.as_view()),
    path("user/forgot-password", views.ForgotPasswordView.as_view()),
    path("user/reset-password", views.ResetPasswordView.as_view()),
    path("user/change-password", views.ChangePasswordView.as_view()),
    path("user/logout", views.LogoutView.as_view()),
    path("user/profile/update-info", views.UpdateProfileView.as_view()),
    path("user/profile/change-password", views.ChangePasswordView.as_view()),

    path('auth/refresh-token', RefreshTokenView.as_view()),

    # Category endpoints
    path("category/create", views.CategoryCreateView.as_view()),
    path("category/edit", views.CategoryEditView.as_view()),
    path("category/delete", views.CategoryDeleteView.as_view()),
    path("category/read", views.CategoryListView.as_view()),
    path("category/<int:category_id>/", views.CategoryDetailView.as_view()),
    path("category/<int:category_id>/tasks/", views.CategoryTasksView.as_view()),

    # Task endpoints
    path("task/create", views.TaskCreateView.as_view()),
    path("task/edit", views.TaskEditView.as_view()),
    path("task/delete", views.TaskDeleteView.as_view()),
    path("task/<int:id>", views.TaskDetailView.as_view()),
    path('tasks/search/<str:search_term>/', views.TaskSearchView.as_view()),
]
