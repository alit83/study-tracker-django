from django.urls import path
from . import views

app_name = 'api-v1'

urlpatterns = [
    path('subject-create/',views.SubjectCreateApiView.as_view(),name='subject-create'),
    path("study-create/",views.StudyCreateApiView.as_view(),name="study-create"),
    path('subject-list/',views.SubjectListApiView.as_view(),name='subject-List'),
    path("study-list/",views.StudyListApiView.as_view(),name="study-List"),
    path("study-retrieve/",views.StudyRetrieveApiView.as_view(),name="study-retrieve")
]
