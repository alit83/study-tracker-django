from django.urls import path , include

app_name = 'study'

urlpatterns = [
    path('api/v1/',include('study.api.v1.urls'))
]
