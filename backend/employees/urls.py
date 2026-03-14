from django.urls import path
from . import views

urlpatterns = [
    # Dashboard
    path('dashboard/', views.dashboard_summary, name='dashboard'),

    # Employees
    path('employees/', views.employee_list, name='employee-list'),
    path('employees/<int:pk>/', views.employee_detail, name='employee-detail'),

    # Attendance
    path('attendance/', views.attendance_list, name='attendance-list'),
    path('attendance/<int:pk>/', views.attendance_detail, name='attendance-detail'),
]
