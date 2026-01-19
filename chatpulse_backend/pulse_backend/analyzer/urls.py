from django.urls import path
from .views import UploadChat

urlpatterns = [
    path('upload/', UploadChat.as_view(), name='upload-chat'),
]
