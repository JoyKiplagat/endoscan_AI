from django.contrib import admin
from django.utils.html import format_html
from .models import PatientProfile, SymptomLog, ScanRecord

@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'get_email', 'location', 'endometriosis_stage', 'diagnosis_date')
    search_fields = ('name', 'user__email', 'location')
    list_filter = ('endometriosis_stage', 'location')
    ordering = ('id',)

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Account Email'

@admin.register(SymptomLog)
class SymptomLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'date', 'pain_level', 'bleeding', 'fatigue')
    list_filter = ('pain_level', 'bleeding', 'fatigue', 'date')
    search_fields = ('patient__name', 'notes', 'questionnaire_summary')

@admin.register(ScanRecord)
class ScanRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'uploaded_at', 'view_scan_link')
    search_fields = ('patient__name', 'diagnostic_notes')

    def view_scan_link(self, obj):
        if obj.scan_file:
            return format_html('<a href="{}" target="_blank" style="font-weight: bold; color: #a41c3c;">View Scan Document ↗</a>', obj.scan_file.url)
        return "No File Attached"
    view_scan_link.short_description = 'Scan Document'
