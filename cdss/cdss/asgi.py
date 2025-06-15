"""
ASGI config for cdss project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cdss.settings')
django_asgi_app = get_asgi_application()

from django_nextjs.asgi import NextJsMiddleware
application = NextJsMiddleware(django_asgi_app)
