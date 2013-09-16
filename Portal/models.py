from django.db import models
from datetime import datetime

from GeoPort import settings


class Place(models.Model):
    """
    A single place on the map.

    By default, Django gives each model the following field:
    id = models.AutoField(primary_key=True)
    """

    title = models.CharField(verbose_name='Place title', max_length=200)
    type = models.CharField(verbose_name='Place type', max_length=200)
    description = models.TextField(blank=True, null=True, verbose_name="Description", max_length=1024)
    email = models.EmailField(verbose_name='Contact email', max_length=200)
    telephone = models.CharField(verbose_name='Contact telephone', max_length=20)
    url = models.CharField(verbose_name='Place website', max_length=200)

    #map fields
    map_center_lng = models.DecimalField(decimal_places=10, max_digits=12,
                                         default=settings.MAP_CENTER_LNG, verbose_name='center_lng')
    map_center_lat = models.DecimalField(decimal_places=10, max_digits=12,
                                         default=settings.MAP_CENTER_LAT, verbose_name='center_lng')
    map_zoom = models.IntegerField(default=settings.MAP_ZOOM, verbose_name='zoom')

    #technical fields
    published = models.DateTimeField(verbose_name='date published', default=datetime.now())
    modified = models.DateTimeField(verbose_name='date modified', default=datetime.now())
    deleted = models.DateTimeField(verbose_name='date deleted', default=datetime.now())
    active = models.BooleanField(default=False)

    def __unicode__(self):
        return self.title