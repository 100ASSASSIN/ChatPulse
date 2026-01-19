# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from .utils import parse_whatsapp_chat  # place parser in utils.py

class UploadChat(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, format=None):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file uploaded"}, status=400)

        # Save temporarily
        with open("tmp_chat.txt", "wb") as f:
            for chunk in file_obj.chunks():
                f.write(chunk)

        result = parse_whatsapp_chat("tmp_chat.txt")
        return Response(result)
