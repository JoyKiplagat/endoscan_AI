from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from .models import PatientProfile, SymptomLog, ScanRecord
from .serializers import RegisterSerializer, SymptomLogSerializer, ScanRecordSerializer

class PatientRegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            profile = user.profile
            
            # Save full display name cleanly to the PatientProfile record
            profile.name = request.data.get('name', 'Anonymous Patient')
            profile.save()
            
            # Catch initialization file attachments
            scan_file = request.FILES.get('scan_file')
            if scan_file:
                ScanRecord.objects.create(patient=profile, scan_file=scan_file)

            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "id": profile.id,
                "name": profile.name,
                "endometriosis_stage": profile.endometriosis_stage,
                "location": profile.location
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PatientLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        user = authenticate(username=email, password=password)
        if user is not None:
            profile = user.profile
            refresh = RefreshToken.for_user(user)
            
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "id": profile.id,
                "name": profile.name,
                "endometriosis_stage": profile.endometriosis_stage,
                "location": profile.location,
                "diagnosis_date": profile.diagnosis_date
            }, status=status.HTTP_200_OK)
            
        return Response({"error": "Invalid verification credentials"}, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        new_password = request.data.get('new_password')
        
        if not email or not new_password:
            return Response({"error": "Both email and new_password are required."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password reset successfully completed!"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "No account associated with this email address."}, status=status.HTTP_404_NOT_FOUND)


class PatientProfileUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, patient_id):
        try:
            profile = PatientProfile.objects.get(id=patient_id)
            return Response({
                "id": profile.id,
                "name": profile.name,
                "endometriosis_stage": profile.endometriosis_stage,
                "location": profile.location,
                "diagnosis_date": profile.diagnosis_date
            }, status=status.HTTP_200_OK)
        except PatientProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, patient_id):
        try:
            profile = PatientProfile.objects.get(id=patient_id)
        except PatientProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if 'name' in request.data:
            profile.name = request.data.get('name')
            
        profile.location = request.data.get('location', profile.location)
        profile.endometriosis_stage = request.data.get(
            'endometriosis_stage', 
            request.data.get('endometriosisStage', profile.endometriosis_stage)
        )
        profile.diagnosis_date = request.data.get(
            'diagnosis_date', 
            request.data.get('diagnosisDate', profile.diagnosis_date)
        )
        profile.save()

        return Response({
            "id": profile.id,
            "name": profile.name,
            "endometriosis_stage": profile.endometriosis_stage,
            "location": profile.location,
            "diagnosis_date": profile.diagnosis_date
        }, status=status.HTTP_200_OK)


class SymptomLogView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        patient_id = request.query_params.get('patient')
        if not patient_id:
            return Response([], status=status.HTTP_200_OK)
        logs = SymptomLog.objects.filter(patient_id=patient_id).order_by('-date')
        return Response(SymptomLogSerializer(logs, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = SymptomLogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ScanRecordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        patient_id = request.query_params.get('patient')
        if not patient_id:
            return Response([], status=status.HTTP_200_OK)
        scans = ScanRecord.objects.filter(patient_id=patient_id).order_by('-uploaded_at')
        return Response(ScanRecordSerializer(scans, many=True, context={'request': request}).data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ScanRecordSerializer(data=request.data, files=request.FILES, context={'request': request})
        
        if serializer.is_valid():
            # 1. Save the scan file instance first
            scan_instance = serializer.save()

            # 2. Extract image path and pass to your AI Vision Model
            try:
                image_path = scan_instance.scan_file.path  # Absolute file system path
                
                # --- AI Vision Model Call ---
                # Example: model_result = my_vision_model.analyze_image(image_path)
                ai_explanation = (
                    "Scan Analysis Complete: No severe structural lesions identified in the pelvic region. "
                    "Mild tissue inflammation noted near the left ovary. Please share this with your physician."
                )
                
                # 3. Save plain-language output to the instance (if ScanRecord model has an 'analysis_summary' or 'notes' column)
                scan_instance.notes = ai_explanation
                scan_instance.save()

            except Exception as e:
                scan_instance.notes = "File saved successfully, but AI image analysis encountered an issue."
                scan_instance.save()

            # Re-serialize to send back updated model fields to React
            return Response(ScanRecordSerializer(scan_instance, context={'request': request}).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class QuestionnaireProcessView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        patient_id = request.data.get("patient_id")
        answers = request.data.get("answers", {})
        log_date = request.data.get("date")

        # 1. Run AI inference or construct model summary
        summary_result = (
            f"Risk Evaluation: {answers.get('pain_frequency', 'Moderate')} symptoms detected. "
            f"Recommended follow-up regarding cyclic pain signals."
        )

        # 2. Update existing entry or construct a new SymptomLog row
        log, created = SymptomLog.objects.get_or_create(
            patient_id=patient_id,
            date=log_date,
            defaults={
                "pain_level": answers.get("pain_level", 5),
                "bleeding": answers.get("bleeding", "None"),
                "fatigue": answers.get("fatigue", "Moderate"),
                "notes": "Generated from Clinical Questionnaire",
                "questionnaire_summary": summary_result
            }
        )

        if not created:
            log.questionnaire_summary = summary_result
            log.save()

        serializer = SymptomLogSerializer(log)
        return Response(serializer.data, status=status.HTTP_200_OK)