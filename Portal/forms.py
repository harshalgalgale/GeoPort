# -*- coding: utf-8 -*-

from django import forms

from models import Place


TYPE_CHOICES = (
    ('1', 'Nurowisko'),
    ('2', 'Keja żeglarska'),
    ('3', 'Sklep żeglarski'),
    ('4', 'Baza nurkowa'),
)

class PlaceCreateForm(forms.ModelForm):

    # don't bother the user with the slug and center, instead calculate them
    map_center_lng = forms.CharField(required=True, widget=forms.HiddenInput())
    map_center_lat = forms.CharField(required=True, widget=forms.HiddenInput())
    map_zoom = forms.CharField(required=True, widget=forms.HiddenInput())

    type = forms.ChoiceField(choices=TYPE_CHOICES)

    class Meta:
        model = Place
        fields = ('title', 'type', 'description', 'email', 'telephone', 'email', 'url',
                  'map_center_lng', 'map_center_lat', 'map_zoom')


