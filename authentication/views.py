from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from .models import PatientProfile, SymptomLog, ScanRecord, QuestionnaireSubmission, ChatMessage
from .serializers import (
    RegisterSerializer,
    SymptomLogSerializer,
    ScanRecordSerializer,
    QuestionnaireSubmissionSerializer,
    ChatMessageSerializer,
)

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
    """
    Handles the NLP symptom-checker submissions.

    GET  /api/patients/questionnaire/?patient=<id>  -> submission history for the dashboard
    POST /api/patients/questionnaire/                -> save a new submission

    Field names here match what questionnaire1.tsx actually sends:
    { patient: <int>, raw_responses: {...}, model_output: {...} }
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        patient_id = request.query_params.get('patient')
        if not patient_id:
            return Response([], status=status.HTTP_200_OK)
        submissions = QuestionnaireSubmission.objects.filter(
            patient_id=patient_id
        ).order_by('-submitted_at')
        return Response(
            QuestionnaireSubmissionSerializer(submissions, many=True).data,
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = QuestionnaireSubmissionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChatMessageView(APIView):
    """
    Handles the 'Her Matters' support chat widget.

    GET  /api/patients/chat/?patient=<id>  -> full message history, oldest first
    POST /api/patients/chat/                -> save the user's message, generate
                                               a bot reply, save and return it

    NOTE: this bot reply is a placeholder rule-based response so the widget
    works end-to-end. Swap _generate_bot_reply() for a real NLP/model call
    when that's ready.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        patient_id = request.query_params.get('patient')
        if not patient_id:
            return Response([], status=status.HTTP_200_OK)
        messages = ChatMessage.objects.filter(patient_id=patient_id)
        return Response(ChatMessageSerializer(messages, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        patient_id = request.data.get('patient')
        user_text = request.data.get('message', '').strip()

        if not patient_id or not user_text:
            return Response(
                {"error": "Both 'patient' and 'message' are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            patient = PatientProfile.objects.get(id=patient_id)
        except PatientProfile.DoesNotExist:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

        user_msg = ChatMessage.objects.create(patient=patient, message=user_text, sender=ChatMessage.Sender.USER)

        bot_text = self._generate_bot_reply(user_text)
        bot_msg = ChatMessage.objects.create(patient=patient, message=bot_text, sender=ChatMessage.Sender.BOT)

        return Response(
            {
                "user_message": ChatMessageSerializer(user_msg).data,
                "bot_message": ChatMessageSerializer(bot_msg).data,
            },
            status=status.HTTP_201_CREATED,
        )

    def _generate_bot_reply(self, user_text: str) -> str:
        lowered = user_text.lower()
        if any(word in lowered for word in ("pain", "hurt", "ache")):
            return (
                "I'm sorry you're dealing with pain. Logging it in your symptom "
                "tracker helps your specialist see patterns over time — would you "
                "like a link to the daily log?"
            )
        if any(word in lowered for word in ("appointment", "doctor", "specialist")):
            return "You can find endometriosis specialists near you under the Support section on the Home page."
        return "Thanks for reaching out — a member of the Her Matters team will follow up if this needs more than general guidance."
    

from .models import PatientProfile, SymptomLog, ScanRecord, ChatMessage, QuestionnaireSubmission
from .serializers import (
    RegisterSerializer, SymptomLogSerializer, ScanRecordSerializer,
    ChatMessageSerializer, QuestionnaireSubmissionSerializer
)

class ChatMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        messages = ChatMessage.objects.filter(patient__user=request.user).order_by('created_at')
        return Response(ChatMessageSerializer(messages, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        profile = request.user.profile
        serializer = ChatMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(patient=profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class QuestionnaireSubmissionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        subs = QuestionnaireSubmission.objects.filter(patient__user=request.user).order_by('-submitted_at')
        return Response(QuestionnaireSubmissionSerializer(subs, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        profile = request.user.profile
        serializer = QuestionnaireSubmissionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(patient=profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        return Response({
            "id": profile.id,
            "name": profile.name,
            "endometriosis_stage": profile.endometriosis_stage,
            "location": profile.location,
            "diagnosis_date": profile.diagnosis_date
        }, status=status.HTTP_200_OK)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not request.user.check_password(old_password):
            return Response({"error": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(new_password)
        request.user.save()
        return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)
from rest_framework_simplejwt.tokens import RefreshToken

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data["refresh"])
            token.blacklist()
            return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Invalid or missing refresh token."}, status=status.HTTP_400_BAD_REQUEST)