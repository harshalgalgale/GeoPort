from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
import json

from django.core.context_processors import csrf

from GeoPort import settings
from Portal.forms import PlaceCreateForm


def render_with_extra_context(template, request, context={}):
    if 'PROJECT_TITLE' not in context:
        context['PROJECT_TITLE'] = settings.PROJECT_TITLE
    if 'MAP_CENTER_LNG' not in context:
        context['MAP_CENTER_LNG'] = settings.MAP_CENTER_LNG
    if 'MAP_CENTER_LAT' not in context:
        context['MAP_CENTER_LAT'] = settings.MAP_CENTER_LAT
    if 'MAP_ZOOM' not in context:
        context['MAP_ZOOM'] = settings.MAP_ZOOM

    return render_to_response(template, RequestContext(request, context))


def home_view(request):
    place_create_form = PlaceCreateForm()
    context = {
        'PLACE_CREATE_FORM': place_create_form,
        'PLACE_ADD_SUCCESS': False,
    }

    context.update(csrf(request))
    return render_with_extra_context('home.html', request, context)


def place_create_view(request):

    if request.method == 'POST' and request.is_ajax():
        form = PlaceCreateForm(request.POST)
        if form.is_valid():
            form.save()
            return HttpResponse(json.dumps(
                                {'success': True}), 'application/json')
        else:
            errors = dict([(k, form.error_class.as_text(v)) for k, v in form.errors.items()])

            return HttpResponse(json.dumps(
                                {'success': False,
                                 'errors': errors}),
                                'application/json')
    else:
        '''GET request not allowed - show home page'''
        return HttpResponseRedirect(reverse('home_view'))
