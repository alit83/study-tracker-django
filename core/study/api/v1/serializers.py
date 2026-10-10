from rest_framework import serializers
from study.models import Study , Subject


class SubjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Subject
        fields = "__all__"


class StudySerializer(serializers.ModelSerializer):

    class Meta:
        model = Study
        fields = "__all__"
