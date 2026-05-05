<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260326000005 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add check_in_date column to attendee_hotel';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE attendee_hotel ADD check_in_date DATE DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE attendee_hotel DROP COLUMN check_in_date');
    }
}
