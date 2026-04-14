<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260326000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add description to hotel, description/category/duration to activity, max_attendees to session';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE hotel ADD description TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE activity ADD description TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE activity ADD category VARCHAR(50) DEFAULT NULL');
        $this->addSql('ALTER TABLE activity ADD duration VARCHAR(20) DEFAULT NULL');
        $this->addSql('ALTER TABLE session ADD max_attendees INT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE hotel DROP description');
        $this->addSql('ALTER TABLE activity DROP description');
        $this->addSql('ALTER TABLE activity DROP category');
        $this->addSql('ALTER TABLE activity DROP duration');
        $this->addSql('ALTER TABLE session DROP max_attendees');
    }
}
