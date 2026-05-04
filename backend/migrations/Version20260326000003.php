<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260326000003 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Replace attendee_hotel join table with attendee_hotel pivot entity (adds nights column)';
    }

    public function up(Schema $schema): void
    {
        // Migrate existing join table data: add id + nights columns
        $this->addSql('ALTER TABLE attendee_hotel DROP CONSTRAINT FK_attendee_hotel_attendee');
        $this->addSql('ALTER TABLE attendee_hotel DROP CONSTRAINT FK_attendee_hotel_hotel');
        $this->addSql('DROP INDEX IDX_attendee_hotel_attendee');
        $this->addSql('DROP INDEX IDX_attendee_hotel_hotel');

        // Add id and nights columns
        $this->addSql('ALTER TABLE attendee_hotel ADD id SERIAL');
        $this->addSql('ALTER TABLE attendee_hotel ADD nights INT NOT NULL DEFAULT 5');

        // Drop composite PK and set new PK on id
        $this->addSql('ALTER TABLE attendee_hotel DROP CONSTRAINT attendee_hotel_pkey');
        $this->addSql('ALTER TABLE attendee_hotel ADD PRIMARY KEY (id)');

        // Re-add foreign keys
        $this->addSql('ALTER TABLE attendee_hotel ADD CONSTRAINT FK_attendee_hotel_attendee FOREIGN KEY (attendee_id) REFERENCES attendee (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE attendee_hotel ADD CONSTRAINT FK_attendee_hotel_hotel FOREIGN KEY (hotel_id) REFERENCES hotel (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE attendee_hotel DROP CONSTRAINT FK_attendee_hotel_attendee');
        $this->addSql('ALTER TABLE attendee_hotel DROP CONSTRAINT FK_attendee_hotel_hotel');
        $this->addSql('ALTER TABLE attendee_hotel DROP CONSTRAINT attendee_hotel_pkey');
        $this->addSql('ALTER TABLE attendee_hotel DROP COLUMN id');
        $this->addSql('ALTER TABLE attendee_hotel DROP COLUMN nights');
        $this->addSql('ALTER TABLE attendee_hotel ADD PRIMARY KEY (attendee_id, hotel_id)');
        $this->addSql('ALTER TABLE attendee_hotel ADD CONSTRAINT FK_attendee_hotel_attendee FOREIGN KEY (attendee_id) REFERENCES attendee (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE attendee_hotel ADD CONSTRAINT FK_attendee_hotel_hotel FOREIGN KEY (hotel_id) REFERENCES hotel (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }
}
