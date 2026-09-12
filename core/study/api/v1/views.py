from rest_framework.generics import (
    ListAPIView,
    CreateAPIView,
    RetrieveAPIView,
)

class SubjectCreateApiView(CreateAPIView):
    serializer_class = 

class StudyCreateApiView(CreateAPIView):
    serializer_class =

class SubjectListApiView(ListAPIView):
    serializer_class =

class StudyListApiView(ListAPIView):
    serializer_class =
    
class StudyRetrieveApiView(RetrieveAPIView):
    serializer_class =