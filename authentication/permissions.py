from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    """Only allow access if the object's patient belongs to the requesting user."""
    def has_object_permission(self, request, view, obj):
        return obj.patient.user == request.user