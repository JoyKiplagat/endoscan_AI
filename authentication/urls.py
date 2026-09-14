from django.urls import path
from .views import (
    PatientRegisterView, 
    PatientLoginView, 
    ForgotPasswordView, 
    PatientProfileUpdateView, 
    SymptomLogView, 
    ScanRecordView,
    QuestionnaireProcessView
)

urlpatterns = [
    path('patients/register/', PatientRegisterView.as_view(), name='register'),
    path('patients/login/', PatientLoginView.as_view(), name='login'),
    path('patients/forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('patients/profile/<int:patient_id>/', PatientProfileUpdateView.as_view(), name='profile-update'),
    path('patients/logs/', SymptomLogView.as_view(), name='logs'),
    path('patients/scans/', ScanRecordView.as_view(), name='scans'),
    path('patients/questionnaire/', QuestionnaireProcessView.as_view(), name='questionnaire-process'),
]