<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260326000002 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Convert hotel ManyToOne to ManyToMany (attendee_hotel join table)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE attendee_hotel (attendee_id INT NOT NULL, hotel_id INT NOT NULL, PRIMARY KEY(attendee_id, hotel_id))');
        $this->addSql('CREATE INDEX IDX_attendee_hotel_attendee ON attendee_hotel (attendee_id)');
        $this->addSql('CREATE INDEX IDX_attendee_hotel_hotel ON attendee_hotel (hotel_id)');
        $this->addSql('ALTER TABLE attendee_hotel ADD CONSTRAINT FK_attendee_hotel_attendee FOREIGN KEY (attendee_id) REFERENCES attendee (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE attendee_hotel ADD CONSTRAINT FK_attendee_hotel_hotel FOREIGN KEY (hotel_id) REFERENCES hotel (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('INSERT INTO attendee_hotel (attendee_id, hotel_id) SELECT id, hotel_id FROM attendee WHERE hotel_id IS NOT NULL');
        $this->addSql('ALTER TABLE attendee DROP COLUMN hotel_id');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE attendee ADD hotel_id INT DEFAULT NULL');
        $this->addSql('UPDATE attendee a SET hotel_id = (SELECT hotel_id FROM attendee_hotel ah WHERE ah.attendee_id = a.id LIMIT 1)');
        $this->addSql('ALTER TABLE attendee_hotel DROP CONSTRAINT FK_attendee_hotel_attendee');
        $this->addSql('ALTER TABLE attendee_hotel DROP CONSTRAINT FK_attendee_hotel_hotel');
        $this->addSql('DROP TABLE attendee_hotel');
    }
}
