from django.db import models

# Create your models here.


class Subject(models.Model):
    name = models.CharField(max_length=255)
    created_date = models.DateTimeField(auto_now_add=True)


class Study(models.Model):
    subject = models.ForeignKey(Subject,on_delete=models.PROTECT)
    started_date = models.DateTimeField(auto_now_add=True)
    ended_date = models.DateTimeField(null=True , blank=True)
