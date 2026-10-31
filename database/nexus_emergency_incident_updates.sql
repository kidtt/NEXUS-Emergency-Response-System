-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: nexus_emergency
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `incident_updates`
--

DROP TABLE IF EXISTS `incident_updates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incident_updates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `incident_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_incident_updates_incident` (`incident_id`),
  CONSTRAINT `incident_updates_ibfk_1` FOREIGN KEY (`incident_id`) REFERENCES `incidents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `incident_updates_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incident_updates`
--

LOCK TABLES `incident_updates` WRITE;
/*!40000 ALTER TABLE `incident_updates` DISABLE KEYS */;
INSERT INTO `incident_updates` VALUES (1,3,2,'REPORTED','Incident reported successfully','2026-09-06 22:50:11'),(2,5,2,'REPORTED','Incident reported successfully','2026-09-07 17:27:54'),(3,4,2,'REPORTED','Incident reported successfully','2026-09-07 17:27:54'),(4,6,2,'REPORTED','Incident reported successfully','2026-09-07 17:31:47'),(5,7,2,'REPORTED','Incident reported successfully','2026-09-08 14:43:51'),(6,8,2,'REPORTED','Incident reported successfully','2026-09-08 14:45:01'),(7,9,2,'REPORTED','Incident reported successfully','2026-09-08 14:46:06'),(8,10,2,'REPORTED','Incident reported successfully','2026-09-08 14:56:25'),(9,11,2,'REPORTED','Incident reported successfully','2026-09-09 11:21:12'),(10,12,2,'REPORTED','Incident reported successfully','2026-09-09 11:21:19'),(11,12,4,'VERIFIED','Incident status changed from REPORTED to VERIFIED','2026-09-19 12:33:44'),(12,12,4,'DISPATCHED','Incident status changed from VERIFIED to DISPATCHED','2026-09-19 12:34:50'),(13,12,4,'IN_PROGRESS','Incident status changed from DISPATCHED to IN_PROGRESS','2026-09-19 13:36:42'),(14,12,4,'RESOLVED','Incident status changed from IN_PROGRESS to RESOLVED','2026-09-22 01:04:53'),(15,12,4,'CLOSED','Incident status changed from RESOLVED to CLOSED','2026-09-22 01:05:01'),(16,1,4,'VERIFIED','Incident status changed from REPORTED to VERIFIED','2026-09-24 14:26:11'),(17,15,9,'REPORTED','Incident reported successfully','2026-09-24 22:58:08'),(18,16,9,'REPORTED','Incident reported successfully','2026-09-24 22:58:23'),(19,17,9,'REPORTED','Incident reported successfully','2026-09-24 22:58:24'),(20,18,9,'REPORTED','Incident reported successfully','2026-09-24 22:58:39'),(21,19,9,'REPORTED','Incident reported successfully','2026-09-24 23:01:08'),(22,20,9,'REPORTED','Incident reported successfully','2026-09-24 23:02:04'),(23,20,4,'FALSE_ALARM','Incident status changed from REPORTED to FALSE_ALARM','2026-09-24 23:22:38'),(24,19,4,'VERIFIED','Incident status changed from REPORTED to VERIFIED','2026-09-24 23:23:12'),(25,19,4,'DISPATCHED','Incident status changed from VERIFIED to DISPATCHED','2026-09-24 23:23:30'),(26,18,4,'VERIFIED','Incident status changed from REPORTED to VERIFIED','2026-09-24 23:23:52'),(27,18,4,'DISPATCHED','Incident status changed from VERIFIED to DISPATCHED','2026-09-28 18:58:53'),(49,44,2,'REPORTED','Incident reported successfully','2026-10-23 23:02:52'),(50,45,2,'REPORTED','Incident reported successfully','2026-10-23 23:03:04'),(51,46,2,'REPORTED','Incident reported successfully','2026-10-23 23:03:08'),(57,52,4,'REPORTED','Incident reported successfully','2026-10-25 18:48:50'),(58,53,4,'REPORTED','Incident reported successfully','2026-10-25 18:49:11'),(59,54,4,'REPORTED','Incident reported successfully','2026-10-25 19:45:41'),(60,55,4,'REPORTED','Incident reported successfully','2026-10-25 19:45:53');
/*!40000 ALTER TABLE `incident_updates` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-26 15:25:31
