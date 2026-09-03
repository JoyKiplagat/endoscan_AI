from rest_framework import serializers
from django.contrib.auth.models import User
from .models import PatientProfile, SymptomLog, ScanRecord

class RegisterSerializer(serializers.ModelSerializer):
    location = serializers.CharField(write_only=True)
    endometriosis_stage = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('email', 'password', 'location', 'endometriosis_stage')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'], # Email doubles as username key
            email=validated_data['email'],
            password=validated_data['password']
        )
        PatientProfile.objects.create(
            user=user,
            location=validated_data['location'],
            endometriosis_stage=validated_data.get('endometriosis_stage', 'Not Diagnosed / Unsure')
        )
        return user

class SymptomLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SymptomLog
        fields = '__all__'

class ScanRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScanRecord
        fields = '__all__'
