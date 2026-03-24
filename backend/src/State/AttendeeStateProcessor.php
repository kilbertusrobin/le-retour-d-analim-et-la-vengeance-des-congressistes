<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Attendee;
use App\Event\AttendeeCreatedEvent;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * Validates business rules before persisting Attendee:
 * - Sessions/activities can only be changed if no invoice has been created yet
 * - Hotel/breakfast can only be changed if no PRINTED invoice exists
 * - Dispatches AttendeeCreatedEvent on POST (for email confirmation)
 */
class AttendeeStateProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
        private EventDispatcherInterface $dispatcher,
        private UserPasswordHasherInterface $hasher,
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof Attendee) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        $isCreate = $operation instanceof Post;

        // Hash password if provided
        if ($data->getPlainPassword() !== null) {
            $data->setPassword($this->hasher->hashPassword($data, $data->getPlainPassword()));
            $data->eraseCredentials();
        }

        // On PATCH or PUT, check business rules
        if (!$isCreate && isset($context['previous_data'])) {
            /** @var Attendee $previous */
            $previous = $context['previous_data'];

            $sessionsChanged = $previous->getSessionRegistration()->toArray() !== $data->getSessionRegistration()->toArray();
            $activitiesChanged = $previous->getActivityRegistration()->toArray() !== $data->getActivityRegistration()->toArray();
            $hotelChanged = $previous->getHotel() !== $data->getHotel();
            $breakfastChanged = $previous->isBreakfast() !== $data->isBreakfast();

            if (($sessionsChanged || $activitiesChanged) && $data->hasInvoice()) {
                throw new UnprocessableEntityHttpException(
                    'Impossible de modifier les inscriptions aux sessions/activités : une facture a déjà été créée.'
                );
            }

            if (($hotelChanged || $breakfastChanged) && $data->hasPrintedInvoice()) {
                throw new UnprocessableEntityHttpException(
                    "Impossible de modifier l'hébergement : la facture a déjà été imprimée."
                );
            }
        }

        $result = $this->persistProcessor->process($data, $operation, $uriVariables, $context);

        // Dispatch creation event for email notification
        if ($isCreate) {
            $this->dispatcher->dispatch(new AttendeeCreatedEvent($data), AttendeeCreatedEvent::NAME);
        }

        return $result;
    }
}
