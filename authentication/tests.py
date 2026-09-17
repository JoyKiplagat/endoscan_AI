from django.test import TestCase
from django.contrib.auth.models import User
from .models import PatientProfile

class RegistrationTests(TestCase):
    def test_register_creates_user_and_profile(self):
        response = self.client.post('/api/patients/register/', {
            'email': 'testpatient@example.com',
            'password': 'strongpassword123',
            'location': 'Nairobi',
            'endometriosis_stage': 'Stage II',
            'name': 'Test Patient'
        })
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(email='testpatient@example.com').exists())
        self.assertTrue(PatientProfile.objects.filter(location='Nairobi').exists())
