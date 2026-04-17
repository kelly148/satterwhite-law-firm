CREATE TABLE `consultationBookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`calendlyEventId` varchar(200) NOT NULL,
	`calendlyEventType` varchar(200),
	`inviteeName` varchar(200),
	`inviteeEmail` varchar(320),
	`inviteePhone` varchar(50),
	`startTime` timestamp,
	`endTime` timestamp,
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`cancelReason` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consultationBookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `consultationBookings_calendlyEventId_unique` UNIQUE(`calendlyEventId`)
);
