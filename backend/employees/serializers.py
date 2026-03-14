import re
from rest_framework import serializers
from .models import Employee, Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id_code = serializers.CharField(source='employee.employee_id', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'employee', 'employee_name', 'employee_id_code',
                  'date', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_status(self, value):
        if value not in ['Present', 'Absent']:
            raise serializers.ValidationError("Status must be 'Present' or 'Absent'.")
        return value

    def validate_date(self, value):
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("Attendance cannot be marked for a future date.")
        return value


class EmployeeSerializer(serializers.ModelSerializer):
    attendance_count = serializers.SerializerMethodField()
    present_days = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = ['id', 'employee_id', 'full_name', 'email', 'department',
                  'created_at', 'attendance_count', 'present_days']
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'employee_id': {'validators': []},  # We handle uniqueness manually
            'email': {'validators': []},
        }

    def get_attendance_count(self, obj):
        return obj.attendances.count()

    def get_present_days(self, obj):
        return obj.attendances.filter(status='Present').count()

    def validate_employee_id(self, value):
        value = value.strip().upper()
        if not value:
            raise serializers.ValidationError("Employee ID is required.")
        if not re.match(r'^[A-Z0-9\-]+$', value):
            raise serializers.ValidationError(
                "Employee ID can only contain letters, numbers, and hyphens.")
        instance = self.instance
        qs = Employee.objects.filter(employee_id=value)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                f"Employee ID '{value}' is already taken. Please use a unique ID.")
        return value

    def validate_email(self, value):
        value = value.strip().lower()
        instance = self.instance
        qs = Employee.objects.filter(email=value)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                "An employee with this email address already exists.")
        return value

    def validate_full_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError(
                "Full name must be at least 2 characters long.")
        return value
