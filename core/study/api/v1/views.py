from rest_framework.generics import (
    ListAPIView,
    CreateAPIView,
    RetrieveAPIView,
)
from study.models import Study , Subject
from .serializers  import StudySerializer , SubjectSerializer

class SubjectCreateApiView(CreateAPIView):
    serializer_class = SubjectSerializer
    queryset = Subject

class StudyCreateApiView(CreateAPIView):
    serializer_class = StudySerializer
    queryset = Study
class SubjectListApiView(ListAPIView):
    serializer_class = SubjectSerializer
    queryset = Subject
class StudyListApiView(ListAPIView):
    serializer_class = StudySerializer
    queryset = Study    
# class StudyRetrieveApiView(RetrieveAPIView):
#     serializer_class = StudySerializer
#     queryset = Study