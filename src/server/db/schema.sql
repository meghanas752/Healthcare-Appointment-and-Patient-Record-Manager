-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: hospital_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `allergies`
--

DROP TABLE IF EXISTS `allergies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `allergies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `details` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_aller_appt_id` (`appointment_id`),
  CONSTRAINT `fk_aller_appt_id` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `allergies`
--

LOCK TABLES `allergies` WRITE;
/*!40000 ALTER TABLE `allergies` DISABLE KEYS */;
/*!40000 ALTER TABLE `allergies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_name` varchar(100) DEFAULT NULL,
  `doctor_name` varchar(100) DEFAULT NULL,
  `appointment_date` date DEFAULT NULL,
  `appointment_time` time DEFAULT NULL,
  `status` enum('Booked','Cancelled','Rescheduled') DEFAULT 'Booked',
  `bed_id` int DEFAULT NULL,
  `patient_email` varchar(255) DEFAULT NULL,
  `patient_contact` varchar(20) DEFAULT NULL,
  `patient_id` int DEFAULT NULL,
  `consultation_fee` decimal(10,2) DEFAULT '50.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `bed_id` (`bed_id`),
  KEY `fk_appt_patient_id` (`patient_id`),
  CONSTRAINT `fk_appt_bed_id` FOREIGN KEY (`bed_id`) REFERENCES `beds` (`id`),
  CONSTRAINT `fk_appt_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (4,'mai','megh','2025-11-20','08:33:00','Booked',1,NULL,NULL,NULL,50.00),(5,'Priya','megha','2025-11-05','23:54:00','Booked',NULL,NULL,NULL,NULL,50.00),(6,'Rhys','megha','2025-11-01','15:39:00','Booked',NULL,NULL,NULL,NULL,50.00),(7,'meg','mai','2025-11-11','23:33:00','Booked',NULL,NULL,NULL,NULL,50.00),(8,'Meghana','maitreyi','2025-11-20','23:03:00','Booked',NULL,'meghana0039@gmail.com','3356577667',NULL,50.00),(14,'Charles','maitreyi','2025-11-17','23:16:00','Booked',NULL,'charles123@gmail.com','545665566',NULL,50.00),(15,'Rhys','Alice','2025-11-17','09:09:00','Booked',NULL,'meghana0039@gmail.com','3465667677',NULL,50.00),(16,'CoverageTest','DrCoverage','2025-12-12','10:00:00','Booked',NULL,'ct@hospital.com','1234567899',NULL,50.00),(17,'CoverageTest','DrCoverage','2025-12-12','10:00:00','Booked',NULL,'ct@hospital.com','1234567899',NULL,50.00),(18,NULL,NULL,NULL,NULL,'Booked',NULL,NULL,NULL,NULL,50.00),(19,'CoverageTest','DrCoverage','2025-12-12','10:00:00','Booked',NULL,'ct@hospital.com','1234567899',NULL,50.00),(20,NULL,NULL,NULL,NULL,'Booked',NULL,NULL,NULL,NULL,50.00),(21,'CoverageTest','DrCoverage','2025-12-12','10:00:00','Booked',NULL,'ct@hospital.com','1234567899',NULL,50.00),(22,NULL,NULL,NULL,NULL,'Booked',NULL,NULL,NULL,NULL,50.00),(23,'CoverageTest','DrCoverage','2025-12-12','10:00:00','Booked',NULL,'ct@hospital.com','1234567899',NULL,50.00),(24,NULL,NULL,NULL,NULL,'Booked',NULL,NULL,NULL,NULL,50.00),(25,'CoverageTest','DrCoverage','2025-12-12','10:00:00','Booked',NULL,'ct@hospital.com','1234567899',NULL,50.00),(26,NULL,NULL,NULL,NULL,'Booked',NULL,NULL,NULL,NULL,50.00),(27,NULL,NULL,NULL,NULL,'Booked',NULL,NULL,NULL,NULL,50.00),(28,'CoverageTest','DrCoverage','2025-12-12','10:00:00','Booked',NULL,'ct@hospital.com','1234567899',NULL,50.00),(29,'CoverageTest','DrCoverage','2025-12-12','10:00:00','Booked',NULL,'ct@hospital.com','1234567899',NULL,50.00),(30,'CoverageTest','DrCoverage','2025-12-12','10:00:00','Booked',NULL,'ct@hospital.com','1234567899',NULL,50.00),(31,'CoverageTest','DrCoverage','2025-12-12','10:00:00','Booked',NULL,'ct@hospital.com','1234567899',NULL,50.00),(32,'CoverageTest','DrCoverage','2025-12-12','10:00:00','Booked',NULL,'ct@hospital.com','1234567899',NULL,50.00),(33,'CoverageTest','DrCoverage','2025-12-12','10:00:00','Booked',NULL,'ct@hospital.com','1234567899',NULL,50.00),(34,'CoverageTest','DrCoverage','2025-12-12','10:00:00','Booked',NULL,'ct@hospital.com','1234567899',NULL,50.00),(35,'CoverageTest','DrCoverage','2025-12-12','10:00:00','Booked',NULL,'ct@hospital.com','1234567899',NULL,50.00),(36,'CoverageTest','DrCoverage','2025-12-12','10:00:00','Booked',NULL,'ct@hospital.com','1234567899',NULL,50.00),(37,'CoverageTest','DrCoverage','2025-12-12','10:00:00','Booked',NULL,'ct@hospital.com','1234567899',NULL,50.00),(38,'Megha','Rhys','2025-11-19','13:00:00','Booked',NULL,'mega@gmail.com','234536778',NULL,50.00),(39,'Megha','Rhys','2025-11-19','13:00:00','Booked',NULL,'mega@gmail.com','234536778',NULL,50.00);
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_audit`
--

DROP TABLE IF EXISTS `auth_audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_audit` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `username_entered` varchar(255) DEFAULT NULL,
  `event_type` enum('LOGIN_SUCCESS','LOGIN_FAILURE','LOCKOUT') NOT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(512) DEFAULT NULL,
  `details` text,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_audit`
--

LOCK TABLES `auth_audit` WRITE;
/*!40000 ALTER TABLE `auth_audit` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_audit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `beds`
--

DROP TABLE IF EXISTS `beds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `beds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bed_number` varchar(50) NOT NULL,
  `is_occupied` tinyint(1) DEFAULT '0',
  `ward_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ward_id` (`ward_id`),
  CONSTRAINT `beds_ibfk_1` FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `beds`
--

LOCK TABLES `beds` WRITE;
/*!40000 ALTER TABLE `beds` DISABLE KEYS */;
INSERT INTO `beds` VALUES (1,'GW-101',1,1),(2,'GW-102',1,1),(3,'GW-103',0,1),(4,'ICU-01',0,2),(5,'ICU-02',0,2);
/*!40000 ALTER TABLE `beds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diagnoses`
--

DROP TABLE IF EXISTS `diagnoses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diagnoses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `details` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_diag_appt_id` (`appointment_id`),
  CONSTRAINT `fk_diag_appt_id` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diagnoses`
--

LOCK TABLES `diagnoses` WRITE;
/*!40000 ALTER TABLE `diagnoses` DISABLE KEYS */;
/*!40000 ALTER TABLE `diagnoses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_items`
--

DROP TABLE IF EXISTS `inventory_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `drug_code` varchar(64) NOT NULL,
  `drug_name` varchar(255) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `price` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `drug_code` (`drug_code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_items`
--

LOCK TABLES `inventory_items` WRITE;
/*!40000 ALTER TABLE `inventory_items` DISABLE KEYS */;
INSERT INTO `inventory_items` VALUES (1,'PCM400','PCM400',19,'2025-11-15 18:13:44',0.00),(2,'bgg12','bgg12',16,'2025-11-15 18:14:41',0.00),(3,'PCM200','PCM200',16,'2025-11-15 18:15:01',40.00);
/*!40000 ALTER TABLE `inventory_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_moves`
--

DROP TABLE IF EXISTS `inventory_moves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_moves` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `drug_code` varchar(64) NOT NULL,
  `qty` int NOT NULL,
  `reason` enum('RESTOCK','DISPENSE') NOT NULL,
  `ref_type` enum('PRESCRIPTION','MANUAL') NOT NULL DEFAULT 'MANUAL',
  `ref_id` bigint DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type` varchar(20) DEFAULT NULL,
  `reference_id` varchar(50) DEFAULT NULL,
  `unit_price` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_moves`
--

LOCK TABLES `inventory_moves` WRITE;
/*!40000 ALTER TABLE `inventory_moves` DISABLE KEYS */;
INSERT INTO `inventory_moves` VALUES (1,'PCM500',4,'RESTOCK','MANUAL',NULL,'2025-11-11 10:11:59','RESTOCK',NULL,0.00),(2,'PCM500',1,'RESTOCK','MANUAL',NULL,'2025-11-11 10:17:26','DISPENSE',NULL,0.00),(3,'PCM500',30,'RESTOCK','MANUAL',NULL,'2025-11-11 10:26:20','RESTOCK',NULL,0.00),(4,'PCM500',4,'RESTOCK','MANUAL',NULL,'2025-11-11 10:26:31','DISPENSE','2',0.00),(5,'PCM400',30,'RESTOCK','MANUAL',NULL,'2025-11-11 10:28:04','RESTOCK',NULL,0.00),(6,'PCM400',4,'DISPENSE','PRESCRIPTION',NULL,'2025-11-11 10:28:11','DISPENSE','2',0.00),(7,'bgg12',20,'RESTOCK','MANUAL',NULL,'2025-11-14 09:42:11','RESTOCK',NULL,0.00),(8,'PCM400',3,'DISPENSE','MANUAL',NULL,'2025-11-15 17:59:16','DISPENSE',NULL,0.00),(9,'PCM200',20,'RESTOCK','MANUAL',NULL,'2025-11-15 18:12:14','RESTOCK',NULL,0.00),(10,'PCM400',4,'DISPENSE','MANUAL',NULL,'2025-11-15 18:13:44','DISPENSE',NULL,0.00),(11,'bgg12',4,'DISPENSE','PRESCRIPTION',NULL,'2025-11-15 18:14:41','DISPENSE','11',0.00),(12,'PCM200',4,'DISPENSE','PRESCRIPTION',NULL,'2025-11-15 18:15:01','DISPENSE','15',40.00);
/*!40000 ALTER TABLE `inventory_moves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `medical_history` text,
  `current_medications` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (1,'John Doe',NULL,NULL,NULL),(2,'Priya Sharma',NULL,NULL,NULL),(3,'David Lee',NULL,NULL,NULL),(4,'Emily White',NULL,NULL,NULL),(5,'John Doe','9876543210','None','None'),(6,'John Doe','9876543210','None','None'),(7,'John Doe','9876543210','None','None'),(8,'John Doe','9876543210','None','None'),(9,'Test User','9999999999','None','None'),(10,'John Doe','9876543210','None','None'),(11,'Test User','9999999999','None','None'),(12,'John Doe','9876543210','None','None'),(13,'Test User','9999999999','None','None'),(14,'John Doe','9876543210','None','None'),(15,'Test User','9999999999','None','None'),(16,'John Doe','9876543210','None','None'),(17,'Test User','9999999999','None','None'),(18,'John Doe','9876543210','None','None'),(19,'Test User','9999999999','None','None'),(20,'John Doe','9876543210','None','None'),(21,'Test User','9999999999','None','None'),(22,'John Doe','9876543210','None','None'),(23,'Test User','9999999999','None','None'),(24,'John Doe','9876543210','None','None'),(25,'John Doe','9876543210','None','None'),(26,'Test User','9999999999','None','None'),(27,'Test User','9999999999','None','None'),(28,'John Doe','9876543210','None','None'),(29,'Test User','9999999999','None','None'),(30,'John Doe','9876543210','None','None'),(31,'John Doe','9876543210','None','None'),(32,'Test User','9999999999','None','None'),(33,'John Doe','9876543210','None','None'),(34,'Test User','9999999999','None','None'),(35,'John Doe','9876543210','None','None'),(36,'Test User','9999999999','None','None'),(37,'John Doe','9876543210','None','None'),(38,'Test User','9999999999','None','None'),(39,'John Doe','9876543210','None','None'),(40,'Test User','9999999999','None','None');
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescriptions`
--

DROP TABLE IF EXISTS `prescriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `details` varchar(255) DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT '10.00',
  PRIMARY KEY (`id`),
  KEY `fk_presc_appt_id` (`appointment_id`),
  CONSTRAINT `fk_presc_appt_id` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescriptions`
--

LOCK TABLES `prescriptions` WRITE;
/*!40000 ALTER TABLE `prescriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `prescriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) NOT NULL,
  `expires` int unsigned DEFAULT NULL,
  `data` text,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `treatments`
--

DROP TABLE IF EXISTS `treatments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `treatments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int DEFAULT NULL,
  `details` varchar(255) NOT NULL,
  `cost` decimal(10,2) NOT NULL,
  `date` date DEFAULT (curdate()),
  PRIMARY KEY (`id`),
  KEY `appointment_id` (`appointment_id`),
  CONSTRAINT `treatments_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `treatments`
--

LOCK TABLES `treatments` WRITE;
/*!40000 ALTER TABLE `treatments` DISABLE KEYS */;
/*!40000 ALTER TABLE `treatments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('PATIENT','DOCTOR','STAFF','ADMIN','PHARMACIST') NOT NULL DEFAULT 'PATIENT',
  `is_locked` tinyint(1) NOT NULL DEFAULT '0',
  `failed_login_count` int NOT NULL DEFAULT '0',
  `last_failed_at` datetime DEFAULT NULL,
  `locked_at` datetime DEFAULT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `failed_attempts` int DEFAULT '0',
  `lockout_until` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Maitreyi','meghana0039@gmail.com','$2b$10$qc15VoNaXwJ0S16FaXqduu6kK4OA0MQq9HkDgcju8mIR54OEAGSMy','DOCTOR',0,0,NULL,NULL,NULL,'2025-11-09 18:40:30','2025-11-09 18:40:30',0,NULL),(2,'Rhys','rhys123@gmail.com','$2b$10$68YN.AZUHFujwleON.Q/6.pA.5URIjBgPuhwYRY6hVl/QrHnLdYr.','DOCTOR',0,0,NULL,NULL,NULL,'2025-11-10 08:42:47','2025-11-10 08:43:42',0,NULL),(5,'mai','mai@gmail.com','$2b$10$tp19hgbNTmGfoHE3IGAv6.QoCdf.uBCh60jqVwzbbv7lUiBiR4ZUi','STAFF',0,0,NULL,NULL,NULL,'2025-11-10 09:06:49','2025-11-10 09:06:49',0,NULL),(6,'Meghana','meghss788@gmail.com','$2b$10$e6OcGeF4yRGB4dTg3C6RU.zH55t499E7GDto1j5KS6lzNTqIfrMsm','PHARMACIST',0,0,NULL,NULL,NULL,'2025-11-14 10:09:15','2025-11-14 10:09:15',0,NULL),(7,'Megha','meghss788@gmail.com','$2b$10$9d/vI31/bDvRYOd.3T.TROE9EyecQeQGb5UaHLUmm2PJYwTu6qVHq','STAFF',0,0,NULL,NULL,NULL,'2025-11-14 22:46:12','2025-11-14 22:46:12',0,NULL),(9,'charles','mai@gmail.com','$2b$10$9JPTezPe3e4o1NX7IrIaDul83vJ0Tq/W2lZfTas9UBOVupr9dx0zK','PHARMACIST',0,0,NULL,NULL,NULL,'2025-11-15 17:55:03','2025-11-15 17:55:03',0,NULL),(10,'alice','alicia123@gmail.com','$2b$10$GRdzly79wkJAHt79azCXrO9FlKytFwlS/cUrA/FwZQscRaMn27ZFG','DOCTOR',0,0,NULL,NULL,NULL,'2025-11-15 18:07:17','2025-11-15 18:07:17',0,NULL),(11,'user1763229297268','u1763229297268@t.com','$2b$10$z9WOcC2FkPnhDPOIe01L7.gQFlIYVrFV.wUJlfeEzmSVp8SzQm0yG','DOCTOR',0,0,NULL,NULL,NULL,'2025-11-15 23:24:57','2025-11-15 23:24:57',0,NULL),(12,'user1763229397717','u1763229397717@t.com','$2b$10$UTwcKeJGTw1UkCsf9dfGouD5.3/uoidaKcop4y1tRRG4xSCv5xZ8u','DOCTOR',0,0,NULL,NULL,NULL,'2025-11-15 23:26:37','2025-11-15 23:26:37',0,NULL),(13,'user1763229445543','u1763229445543@t.com','$2b$10$tMjI4ldrui3XptKQXzRz3eNpBgpzEV.eCV/9M.gA10Ey3ccw1QRP6','DOCTOR',0,0,NULL,NULL,NULL,'2025-11-15 23:27:25','2025-11-15 23:27:25',0,NULL),(14,'user1763229511909','u1763229511909@t.com','$2b$10$lG58HZRN4tyaoddnoVS5JeRniSNEXc7/8PUpCdrzOEDQ78nRpJCYC','DOCTOR',0,0,NULL,NULL,NULL,'2025-11-15 23:28:32','2025-11-15 23:28:32',0,NULL),(15,'user1763229662426','u1763229662426@t.com','$2b$10$ut2azezg9zh7nqWaDOsdhupQMOk5y4CBbOs/E4PrGSasR6EHTWsq6','DOCTOR',0,0,NULL,NULL,NULL,'2025-11-15 23:31:02','2025-11-15 23:31:02',0,NULL),(16,'user1763229829144','u1763229829144@t.com','$2b$10$Lp.X75f6pincmMhpjmFbVed6cw2a2tWW4JJUeImpy7x5u5/Cnkh4y','DOCTOR',0,0,NULL,NULL,NULL,'2025-11-15 23:33:49','2025-11-15 23:33:49',0,NULL),(17,'user1763229949550','u1763229949550@t.com','$2b$10$gVctJNmD/nPmIGZ9zRCFOertrLsSWYLvG/hWMRNXkkkY8lXjRvtTO','DOCTOR',0,0,NULL,NULL,NULL,'2025-11-15 23:35:49','2025-11-15 23:35:49',0,NULL),(18,'user1763229964374','u1763229964374@t.com','$2b$10$HcoPZzOSYdHwxSDP8O3VC.YROay9THKcE6fLaCalgSsDKvO5bAhVy','DOCTOR',0,0,NULL,NULL,NULL,'2025-11-15 23:36:04','2025-11-15 23:36:04',0,NULL),(19,'user1763230049267','u1763230049267@t.com','$2b$10$HPsbPJBX8WJdu./yjbJsVOjXgdnIUJxsTrnGCA1/eKp/WbFOZpkXG','DOCTOR',0,0,NULL,NULL,NULL,'2025-11-15 23:37:29','2025-11-15 23:37:29',0,NULL),(20,'user1763230161556','u1763230161556@t.com','$2b$10$hXuSxxh1uXjX3wLGIjScGekBXcT2mdldAgRceWdKFHs4ASrW1bSki','DOCTOR',0,0,NULL,NULL,NULL,'2025-11-15 23:39:21','2025-11-15 23:39:21',0,NULL),(21,'user1763230310117','u1763230310117@t.com','$2b$10$tB46cToRBUIOiRNE1ZMMOO6WNHgRMjD5DL6Eth9vr64Wa7OQZY0ta','DOCTOR',0,0,NULL,NULL,NULL,'2025-11-15 23:41:50','2025-11-15 23:41:50',0,NULL),(22,'user1763230447649','u1763230447649@t.com','$2b$10$8TO10hnnhxQZQi0vfmVd.eBBXw5VpiWWd6G04H8kbbHV1dDv1..Yy','DOCTOR',0,0,NULL,NULL,NULL,'2025-11-15 23:44:07','2025-11-15 23:44:07',0,NULL),(23,'user1763230460265','u1763230460265@t.com','$2b$10$O06ltASeLnXNz0DLY4waGed1cqbV6UfiZUkY5XOHv3Kn2l2LSAupe','DOCTOR',0,0,NULL,NULL,NULL,'2025-11-15 23:44:20','2025-11-15 23:44:20',0,NULL),(24,'user1763230617008','u1763230617008@t.com','$2b$10$OfzhfC1voJgD7KVFL1qKCubXnY8HVlf0V//V6podnff8jDvGseRf2','DOCTOR',0,0,NULL,NULL,NULL,'2025-11-15 23:46:57','2025-11-15 23:46:57',0,NULL),(25,'user1763230765177','u1763230765177@t.com','$2b$10$gZiLmzj13M.ehMPU3h1PkO.mYDU31lFw7iftb4S2v.5yK/KcRBwqC','DOCTOR',0,0,NULL,NULL,NULL,'2025-11-15 23:49:25','2025-11-15 23:49:25',0,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wards`
--

DROP TABLE IF EXISTS `wards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `ward_type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wards`
--

LOCK TABLES `wards` WRITE;
/*!40000 ALTER TABLE `wards` DISABLE KEYS */;
INSERT INTO `wards` VALUES (1,'General Ward','GW'),(2,'Intensive Care Unit','ICU');
/*!40000 ALTER TABLE `wards` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-16 11:36:58
