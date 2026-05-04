#!/bin/sh
set -e

chown -R www-data:www-data /var/www/html/var

php bin/console lexik:jwt:generate-keypair --overwrite --no-interaction

php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

if [ ! -f /var/www/html/var/.fixtures_loaded ]; then
    php bin/console doctrine:fixtures:load --no-interaction
    touch /var/www/html/var/.fixtures_loaded
fi

exec "$@"
