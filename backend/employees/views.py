from datetime import date
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q

from .models import Employee, Attendance
from .serializers import EmployeeSerializer, AttendanceSerializer


# ── Employee Views ──────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
def employee_list(request):
    if request.method == 'GET':
        employees = Employee.objects.all()
        department = request.query_params.get('department')
        if department:
            employees = employees.filter(department=department)
        serializer = EmployeeSerializer(employees, many=True)
        return Response({'results': serializer.data, 'count': employees.count()})

    elif request.method == 'POST':
        serializer = EmployeeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'DELETE'])
def employee_detail(request, pk):
    employee = get_object_or_404(Employee, pk=pk)

    if request.method == 'GET':
        serializer = EmployeeSerializer(employee)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        employee.delete()
        return Response({'message': 'Employee deleted successfully.'}, status=status.HTTP_200_OK)


# ── Attendance Views ────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
def attendance_list(request):
    if request.method == 'GET':
        attendances = Attendance.objects.select_related('employee').all()

        # Filters
        emp_id = request.query_params.get('employee')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        filter_date = request.query_params.get('date')
        filter_status = request.query_params.get('status')

        if emp_id:
            attendances = attendances.filter(employee_id=emp_id)
        if filter_date:
            attendances = attendances.filter(date=filter_date)
        if date_from:
            attendances = attendances.filter(date__gte=date_from)
        if date_to:
            attendances = attendances.filter(date__lte=date_to)
        if filter_status:
            attendances = attendances.filter(status=filter_status)

        serializer = AttendanceSerializer(attendances, many=True)
        return Response({'results': serializer.data, 'count': attendances.count()})

    elif request.method == 'POST':
        serializer = AttendanceSerializer(data=request.data)
        if serializer.is_valid():
            employee = serializer.validated_data['employee']
            att_date = serializer.validated_data['date']

            # Check for duplicate attendance
            existing = Attendance.objects.filter(employee=employee, date=att_date).first()
            if existing:
                # Update if already exists
                existing.status = serializer.validated_data['status']
                existing.save()
                return Response(AttendanceSerializer(existing).data, status=status.HTTP_200_OK)

            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'DELETE'])
def attendance_detail(request, pk):
    attendance = get_object_or_404(Attendance, pk=pk)

    if request.method == 'GET':
        serializer = AttendanceSerializer(attendance)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        attendance.delete()
        return Response({'message': 'Attendance record deleted.'}, status=status.HTTP_200_OK)


# ── Dashboard View ──────────────────────────────────────────────────────────

@api_view(['GET'])
def dashboard_summary(request):
    total_employees = Employee.objects.count()
    departments = Employee.objects.values('department').annotate(count=Count('id')).order_by('-count')

    today = date.today()
    today_present = Attendance.objects.filter(date=today, status='Present').count()
    today_absent = Attendance.objects.filter(date=today, status='Absent').count()
    today_total = Attendance.objects.filter(date=today).count()
    today_unmarked = total_employees - today_total

    # Recent attendance (last 7 days)
    recent_attendance = (
        Attendance.objects
        .select_related('employee')
        .order_by('-date', '-created_at')[:20]
    )

    return Response({
        'total_employees': total_employees,
        'today': {
            'present': today_present,
            'absent': today_absent,
            'marked': today_total,
            'unmarked': today_unmarked,
        },
        'departments': list(departments),
        'recent_attendance': AttendanceSerializer(recent_attendance, many=True).data,
    })
