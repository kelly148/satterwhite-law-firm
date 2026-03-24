CREATE TABLE `intakeSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientName` varchar(200) NOT NULL,
	`clientEmail` varchar(320) NOT NULL,
	`clientPhone` varchar(50),
	`formDataJson` text NOT NULL,
	`pdfUrl` varchar(500),
	`pdfGenerated` timestamp,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `intakeSubmissions_id` PRIMARY KEY(`id`)
);
