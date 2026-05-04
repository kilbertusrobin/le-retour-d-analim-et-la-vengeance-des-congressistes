<?php

namespace App\DataFixtures;

use App\Entity\Activity;
use App\Entity\Attendee;
use App\Entity\AttendeeHotel;
use App\Entity\Hotel;
use App\Entity\Invoice;
use App\Entity\Payment;
use App\Entity\PayerOrganization;
use App\Entity\Session;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * REQUIRES:
 *   composer require --dev doctrine/doctrine-fixtures-bundle fakerphp/faker
 *
 * Usage:
 *   php bin/console doctrine:fixtures:load
 *   php bin/console doctrine:fixtures:load --append   (keep existing data)
 */
class AppFixtures extends Fixture
{
    // Congress dates: 5 working days (Mon–Fri)
    private const CONGRESS_START = '2026-06-08';
    private const CONGRESS_DAYS  = 5;

    public function __construct(
        private UserPasswordHasherInterface $hasher,
    ) {}

    public function load(ObjectManager $manager): void
    {
        $faker = \Faker\Factory::create('fr_FR');
        $faker->seed(42); // reproducible data

        // ── Hotels ────────────────────────────────────────────────────────────
        $hotelsData = [
            ['name' => 'Ibis Limoges Centre', 'address' => '2 place Jourdan, 87000 Limoges', 'category' => '2 étoiles', 'night' => 65.0, 'breakfast' => 10.0, 'description' => 'Hôtel économique idéalement situé à deux pas de la gare de Limoges. Chambres fonctionnelles et confortables, parfaites pour les congressistes souhaitant maîtriser leur budget sans sacrifier la praticité.'],
            ['name' => 'Hôtel Mercure Limoges', 'address' => '29 place Wilson, 87000 Limoges', 'category' => '3 étoiles', 'night' => 95.0, 'breakfast' => 15.0, 'description' => 'Au cœur du centre historique de Limoges, cet hôtel propose des chambres modernes avec vue sur la place Wilson. Service attentionné et restaurant gastronomique sur place.'],
            ['name' => 'Royal Limousin', 'address' => '1 place de la République, 87000 Limoges', 'category' => '4 étoiles', 'night' => 140.0, 'breakfast' => 20.0, 'description' => 'Palace emblématique de Limoges, le Royal Limousin offre une expérience haut de gamme à deux pas du Palais des Congrès. Spa, piscine intérieure et suites luxueuses pour un séjour d\'exception.'],
            ['name' => 'Résidence Les Lilas', 'address' => '8 rue Montmailler, 87000 Limoges', 'category' => '1 étoile', 'night' => 45.0, 'breakfast' => 7.0, 'description' => 'Résidence hôtelière paisible dans un quartier résidentiel de Limoges. Studios équipés avec kitchenette, idéals pour les séjours prolongés. Accès facile au centre-ville par les transports en commun.'],
        ];
        $hotels = [];
        foreach ($hotelsData as $data) {
            $hotel = (new Hotel())
                ->setName($data['name'])
                ->setAddress($data['address'])
                ->setCategory($data['category'])
                ->setNightPrice($data['night'])
                ->setBreakfastPrice($data['breakfast'])
                ->setDescription($data['description']);
            $manager->persist($hotel);
            $hotels[] = $hotel;
        }

        // ── Sessions ──────────────────────────────────────────────────────────
        $sessionsData = [
            ['label' => 'Tennis et stratégie', 'day' => 0, 'half' => 'am', 'price' => 80, 'max' => 120],
            ['label' => 'Football féminin : vers la professionnalisation', 'day' => 0, 'half' => 'pm', 'price' => 80, 'max' => 80],
            ['label' => 'Équipement du bowling', 'day' => 1, 'half' => 'am', 'price' => 60, 'max' => 60],
            ['label' => 'Tennis en fauteuil roulant', 'day' => 1, 'half' => 'pm', 'price' => 60, 'max' => 50],
            ['label' => 'Finance des ligues sportives', 'day' => 2, 'half' => 'am', 'price' => 100, 'max' => 100],
            ['label' => 'Gestion des bénévoles', 'day' => 2, 'half' => 'pm', 'price' => 100, 'max' => 90],
            ['label' => 'Sport et handicap', 'day' => 3, 'half' => 'am', 'price' => 80, 'max' => 150],
            ['label' => 'Communication digitale pour les ligues', 'day' => 3, 'half' => 'pm', 'price' => 80, 'max' => 200],
            ['label' => 'Droit du sport', 'day' => 4, 'half' => 'am', 'price' => 120, 'max' => 70],
            ['label' => 'Clôture : perspectives 2027', 'day' => 4, 'half' => 'pm', 'price' => 50, 'max' => 300],
        ];
        $sessions = [];
        $congressStart = new \DateTime(self::CONGRESS_START);
        foreach ($sessionsData as $data) {
            $date = (clone $congressStart)->modify("+{$data['day']} days");
            $date->setTime($data['half'] === 'am' ? 9 : 14, 0);
            $session = (new Session())
                ->setLabel($data['label'])
                ->setStartDate($date)
                ->setDurationHalfDays(1)
                ->setPrice($data['price'])
                ->setMaxAttendees($data['max']);
            $manager->persist($session);
            $sessions[] = $session;
        }

        // ── Activities ───────────────────────────────────────────────────────
        $activitiesData = [
            ['label' => 'Visite de la cathédrale Saint-Étienne', 'day' => 0, 'hour' => 18, 'price' => 15, 'category' => 'Culture', 'duration' => '1h30', 'description' => 'Explorez ce chef-d\'œuvre gothique du XIIIe siècle, ses vitraux exceptionnels et son jubé Renaissance, accompagné d\'un guide conférencier passionné.'],
            ['label' => 'Concert de jazz au Zénith de Limoges', 'day' => 1, 'hour' => 20, 'price' => 35, 'category' => 'Divertissement', 'duration' => '2h', 'description' => 'Une soirée musicale exceptionnelle avec des artistes de renom dans le cadre chaleureux du Zénith de Limoges. Jazz contemporain et standards revisités.'],
            ['label' => 'Excursion aux Gorges de la Vézère', 'day' => 2, 'hour' => 9, 'price' => 45, 'category' => 'Nature', 'duration' => '4h', 'description' => 'Partez à la découverte des paysages sauvages des gorges de la Vézère. Randonnée guidée avec arrêts panoramiques et pique-nique local inclus.'],
            ['label' => 'Atelier porcelaine de Limoges', 'day' => 2, 'hour' => 17, 'price' => 30, 'category' => 'Culture', 'duration' => '2h', 'description' => 'Initiez-vous à l\'art de la porcelaine de Limoges avec un maître artisan. Façonnez et décorez votre propre pièce que vous pourrez emporter en souvenir.'],
            ['label' => 'Spectacle son et lumière — Château de Chalusset', 'day' => 3, 'hour' => 21, 'price' => 25, 'category' => 'Divertissement', 'duration' => '1h30', 'description' => 'Plongez dans l\'histoire médiévale du Limousin lors de ce spectacle nocturne époustouflant au château de Chalusset. Projections, musique et narration immersive.'],
            ['label' => 'Visite du musée des Beaux-Arts', 'day' => 1, 'hour' => 16, 'price' => 10, 'category' => 'Culture', 'duration' => '1h30', 'description' => 'Découvrez les collections permanentes du musée municipal : peintures flamandes, émaux limousins et sculptures du XVIIIe siècle dans un palais épiscopal restauré.'],
            ['label' => 'Randonnée sur les chemins de Saint-Jacques', 'day' => 4, 'hour' => 8, 'price' => 20, 'category' => 'Nature', 'duration' => '3h', 'description' => 'Marchez sur les traces des pèlerins médiévaux le long d\'un tronçon du célèbre chemin de Compostelle qui traverse Limoges. Guide et équipement fournis.'],
            ['label' => 'Dîner gala de clôture', 'day' => 4, 'hour' => 19, 'price' => 65, 'category' => 'Gastronomie', 'duration' => '3h', 'description' => 'Clôturez le congrès en beauté lors d\'un dîner gastronomique en salle de prestige. Menu 5 services élaboré par un chef étoilé, vins du Limousin et animation musicale.'],
        ];
        $activities = [];
        foreach ($activitiesData as $data) {
            $date = (clone $congressStart)->modify("+{$data['day']} days");
            $date->setTime($data['hour'], 0);
            $activity = (new Activity())
                ->setLabel($data['label'])
                ->setDateTime($date)
                ->setPrice($data['price'])
                ->setCategory($data['category'])
                ->setDuration($data['duration'])
                ->setDescription($data['description']);
            $manager->persist($activity);
            $activities[] = $activity;
        }

        // ── Payer Organizations ───────────────────────────────────────────────
        $orgsData = [
            ['name' => 'Ligue Grand Est de Tennis', 'address' => '12 rue du Sport, 67000 Strasbourg'],
            ['name' => 'Université de Lorraine', 'address' => '34 cours Léopold, 54000 Nancy'],
            ['name' => 'Lycée Suzanne Valadon', 'address' => '2 rue Camille Guérin, 87000 Limoges'],
        ];
        $organizations = [];
        foreach ($orgsData as $data) {
            $org = (new PayerOrganization())
                ->setName($data['name'])
                ->setAddress($data['address']);
            $manager->persist($org);
            $organizations[] = $org;
        }

        $manager->flush(); // persist before ManyToMany links

        // ── Attendees ─────────────────────────────────────────────────────────
        $attendees = [];

        // 20 attendees with varied configurations
        for ($i = 0; $i < 20; $i++) {
            $attendee = (new Attendee())
                ->setFirstName($faker->firstName())
                ->setLastName($faker->lastName())
                ->setAddress($faker->address())
                ->setEmail($faker->unique()->safeEmail())
                ->setDeposit(100.0)
                ->setBreakfast($faker->boolean(40))
                ->setRoles($i === 0 ? ['ROLE_ADMIN'] : [])
                ->setPassword($this->hasher->hashPassword(new Attendee(), 'user1234'));

            // Assign hotel to 15 out of 20
            if ($i < 15) {
                $booking = (new AttendeeHotel())
                    ->setHotel($hotels[$i % count($hotels)])
                    ->setNights(self::CONGRESS_DAYS)
                    ->setBreakfast($faker->boolean(40))
                    ->setCheckInDate(new \DateTime(self::CONGRESS_START));
                $attendee->addHotelBooking($booking);
            }

            // Assign organization to 8 out of 20
            if ($i < 8) {
                $attendee->setOrganization($organizations[$i % count($organizations)]);
            }

            // Register for 1–3 random sessions (for first 15 attendees)
            if ($i < 15) {
                $sessionCount = $faker->numberBetween(1, 3);
                $sessionKeys  = $faker->randomElements(array_keys($sessions), $sessionCount);
                foreach ($sessionKeys as $key) {
                    $attendee->addSessionRegistration($sessions[$key]);
                }
            }

            // Register for 0–2 activities (for first 12 attendees)
            if ($i < 12) {
                $actCount = $faker->numberBetween(0, 2);
                $actKeys  = $faker->randomElements(array_keys($activities), $actCount);
                foreach ($actKeys as $key) {
                    $attendee->addActivityRegistration($activities[$key]);
                }
            }

            $manager->persist($attendee);
            $attendees[] = $attendee;
        }

        $manager->flush();

        // ── Invoices & Payments ───────────────────────────────────────────────
        $invoiceCount = 0;

        foreach ($attendees as $i => $attendee) {
            // Create invoices for first 7 attendees
            if ($i >= 7) break;

            $total = $this->calculateTotal($attendee);

            $invoice = (new Invoice())
                ->setAttendee($attendee)
                ->setCreationDate((new \DateTime())->modify("-{$i} days"))
                ->setTotalAmount($total)
                ->setPrint($i < 2) // first 2 are printed
                ->setSettled(false);

            $manager->persist($invoice);

            // Add payments for printed invoices (first 2)
            if ($i < 2) {
                $payment = (new Payment())
                    ->setInvoice($invoice)
                    ->setAmount($total)
                    ->setPaymentDate((new \DateTime())->modify("-{$i} days"))
                    ->setOrganization($i === 0 ? $organizations[0] : null);
                $manager->persist($payment);
                $invoice->setSettled(true);
            }

            $invoiceCount++;
        }

        $manager->flush();
    }

    private function calculateTotal(Attendee $attendee): float
    {
        $total = 0.0;
        foreach ($attendee->getHotelBookings() as $booking) {
            $hotel = $booking->getHotel();
            if ($hotel !== null) {
                $total += $hotel->getNightPrice() * $booking->getNights();
                if ($booking->isBreakfast()) {
                    $total += $hotel->getBreakfastPrice() * $booking->getNights();
                }
            }
        }
        foreach ($attendee->getSessionRegistration() as $session) {
            $total += $session->getPrice();
        }
        foreach ($attendee->getActivityRegistration() as $activity) {
            $total += $activity->getPrice();
        }
        return round(max(0.0, $total - ($attendee->getDeposit() ?? 0.0)), 2);
    }
}
