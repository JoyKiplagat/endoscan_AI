from django.db import models
from django.contrib.auth.models import User

class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    name = models.CharField(max_length=255, default="Anonymous")
    location = models.CharField(max_length=255)
    endometriosis_stage = models.CharField(max_length=100, default="Not Diagnosed / Unsure")
    diagnosis_date = models.CharField(max_length=100, default="N/A")
    
    def __str__(self):
        return self.name

class SymptomLog(models.Model):
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name="logs")
    date = models.DateField(auto_now_add=True)
    pain_level = models.IntegerField()
    bleeding = models.CharField(max_length=50)
    fatigue = models.CharField(max_length=50)
    notes = models.TextField(blank=True, null=True)
    questionnaire_summary = models.TextField(blank=True, null=True) 
    def __str__(self):
        return f"Symptom Log {self.id} for {self.patient.name}"
class ScanRecord(models.Model):
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name="scans")
    scan_file = models.FileField(upload_to="patient_scans/")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)
    def __str__(self):
        return f"Scan Record {self.id} for {self.patient.name}"
