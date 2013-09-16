--postgres usage
CREATE USER geoport WITH PASSWORD 'djangoadm';
ALTER ROLE geoport VALID UNTIL 'infinity';
ALTER ROLE geoport CREATEROLE CREATEDB;

CREATE DATABASE geoportdb
  WITH OWNER = geoport
   	ENCODING = 'UTF8'
   	CONNECTION LIMIT = -1
;

GRANT CONNECT ON DATABASE geoportdb TO geoport;

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'geoportdb',                      # Or path to database file if using sqlite3.
        # The following settings are not used with sqlite3:
        'USER': 'geoport',
        'PASSWORD': 'djangoadm',
        'HOST': '127.0.0.1',                      # Empty for localhost through domain sockets or '127.0.0.1' for localhost through TCP.
        'PORT': '5432',                      # Set to empty string for default.
    }
}
