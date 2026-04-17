CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stripePaymentIntentId` varchar(200) NOT NULL,
	`stripeSessionId` varchar(200),
	`customerName` varchar(200),
	`customerEmail` varchar(320),
	`serviceName` varchar(200),
	`serviceId` varchar(100),
	`amountCents` int NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'usd',
	`status` varchar(50) NOT NULL DEFAULT 'completed',
	`paidAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_stripePaymentIntentId_unique` UNIQUE(`stripePaymentIntentId`)
);
