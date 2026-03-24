<?php

namespace App\EventListener;

use App\Event\AttendeeCreatedEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

/**
 * Sends a confirmation email when a new attendee is registered.
 *
 * REQUIRES (run before activating this feature):
 *   composer require symfony/mailer symfony/twig-bundle symfony/mime
 *
 * Then uncomment the constructor injection and the email-sending code below.
 */
#[AsEventListener(event: AttendeeCreatedEvent::NAME)]
class SendConfirmationEmailListener
{
    public function __construct(
        // Uncomment after: composer require symfony/mailer symfony/twig-bundle
        // private readonly \Symfony\Component\Mailer\MailerInterface $mailer,
    ) {}

    public function __invoke(AttendeeCreatedEvent $event): void
    {
        $attendee = $event->getAttendee();

        // Uncomment once symfony/mailer is installed:
        // $email = (new \Symfony\Bridge\Twig\Mime\TemplatedEmail())
        //     ->from(new \Symfony\Component\Mime\Address('congres@analim.fr', 'Congrès ANALIM'))
        //     ->to(new \Symfony\Component\Mime\Address(
        //         $attendee->getEmail(),
        //         $attendee->getFirstName().' '.$attendee->getLastName()
        //     ))
        //     ->subject('Confirmation de votre inscription au Congrès ANALIM')
        //     ->htmlTemplate('emails/confirmation.html.twig')
        //     ->context(['attendee' => $attendee]);
        //
        // $this->mailer->send($email);
    }
}
