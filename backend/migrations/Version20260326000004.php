<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260326000004 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add breakfast column to attendee_hotel';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE attendee_hotel ADD breakfast BOOLEAN NOT NULL DEFAULT FALSE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE attendee_hotel DROP COLUMN breakfast');
    }
}
