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
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `incident_id` int DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `type` enum('INFO','WARNING','EMERGENCY','SYSTEM') DEFAULT 'INFO',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `incident_id` (`incident_id`),
  KEY `idx_notifications_user` (`user_id`),
  KEY `idx_notifications_unread` (`user_id`,`is_read`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`incident_id`) REFERENCES `incidents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,4,15,'? CRITICAL INCIDENT ESCALATION','Incident #15 requires immediate emergency response. Risk: EXTREME. Priority: 80.','EMERGENCY',0,'2026-09-24 22:58:07'),(2,4,15,'? ACCIDENT Emergency','New ACCIDENT incident reported at dfghj. Risk level: EXTREME. Priority: 80.','EMERGENCY',0,'2026-09-24 22:58:07'),(3,8,15,'? ACCIDENT Emergency','New ACCIDENT incident reported at dfghj. Risk level: EXTREME. Priority: 80.','EMERGENCY',0,'2026-09-24 22:58:07'),(4,4,16,'? CRITICAL INCIDENT ESCALATION','Incident #16 requires immediate emergency response. Risk: EXTREME. Priority: 80.','EMERGENCY',0,'2026-09-24 22:58:23'),(5,4,16,'? ACCIDENT Emergency','New ACCIDENT incident reported at dfghj. Risk level: EXTREME. Priority: 80.','EMERGENCY',0,'2026-09-24 22:58:23'),(6,8,16,'? ACCIDENT Emergency','New ACCIDENT incident reported at dfghj. Risk level: EXTREME. Priority: 80.','EMERGENCY',0,'2026-09-24 22:58:23'),(7,4,17,'? CRITICAL INCIDENT ESCALATION','Incident #17 requires immediate emergency response. Risk: EXTREME. Priority: 80.','EMERGENCY',0,'2026-09-24 22:58:24'),(8,4,17,'? ACCIDENT Emergency','New ACCIDENT incident reported at dfghj. Risk level: EXTREME. Priority: 80.','EMERGENCY',0,'2026-09-24 22:58:24'),(9,8,17,'? ACCIDENT Emergency','New ACCIDENT incident reported at dfghj. Risk level: EXTREME. Priority: 80.','EMERGENCY',0,'2026-09-24 22:58:24'),(10,4,18,'? CRITICAL INCIDENT ESCALATION','Incident #18 requires immediate emergency response. Risk: EXTREME. Priority: 80.','EMERGENCY',0,'2026-09-24 22:58:39'),(11,4,18,'? ACCIDENT Emergency','New ACCIDENT incident reported at dfghj. Risk level: EXTREME. Priority: 80.','EMERGENCY',0,'2026-09-24 22:58:39'),(12,8,18,'? ACCIDENT Emergency','New ACCIDENT incident reported at dfghj. Risk level: EXTREME. Priority: 80.','EMERGENCY',0,'2026-09-24 22:58:39'),(13,4,19,'? FIRE Emergency','New FIRE incident reported at bnm. Risk level: MEDIUM. Priority: 48.','WARNING',0,'2026-09-24 23:01:08'),(14,8,19,'? FIRE Emergency','New FIRE incident reported at bnm. Risk level: MEDIUM. Priority: 48.','WARNING',0,'2026-09-24 23:01:08'),(15,4,20,'? ACCIDENT Emergency','New ACCIDENT incident reported at cvbnm. Risk level: HIGH. Priority: 60.','EMERGENCY',0,'2026-09-24 23:02:04'),(16,8,20,'? ACCIDENT Emergency','New ACCIDENT incident reported at cvbnm. Risk level: HIGH. Priority: 60.','EMERGENCY',0,'2026-09-24 23:02:04'),(68,4,44,'? CRITICAL INCIDENT ESCALATION','Incident #44 requires immediate emergency response. Risk: EXTREME. Priority: 87.','EMERGENCY',0,'2026-10-23 23:02:52'),(69,4,44,'? FLOOD Emergency','New FLOOD incident reported at hj. Risk level: EXTREME. Priority: 87.','EMERGENCY',0,'2026-10-23 23:02:52'),(70,8,44,'? FLOOD Emergency','New FLOOD incident reported at hj. Risk level: EXTREME. Priority: 87.','EMERGENCY',0,'2026-10-23 23:02:52'),(71,4,45,'? CRITICAL INCIDENT ESCALATION','Incident #45 requires immediate emergency response. Risk: EXTREME. Priority: 87.','EMERGENCY',0,'2026-10-23 23:03:04'),(72,4,45,'? FLOOD Emergency','New FLOOD incident reported at hj. Risk level: EXTREME. Priority: 87.','EMERGENCY',0,'2026-10-23 23:03:04'),(73,8,45,'? FLOOD Emergency','New FLOOD incident reported at hj. Risk level: EXTREME. Priority: 87.','EMERGENCY',0,'2026-10-23 23:03:04'),(74,4,46,'? CRITICAL INCIDENT ESCALATION','Incident #46 requires immediate emergency response. Risk: EXTREME. Priority: 87.','EMERGENCY',0,'2026-10-23 23:03:08'),(75,4,46,'? FLOOD Emergency','New FLOOD incident reported at hj. Risk level: EXTREME. Priority: 87.','EMERGENCY',0,'2026-10-23 23:03:08'),(76,8,46,'? FLOOD Emergency','New FLOOD incident reported at hj. Risk level: EXTREME. Priority: 87.','EMERGENCY',0,'2026-10-23 23:03:08'),(92,4,52,'? LANDSLIDE Emergency','New LANDSLIDE incident reported at Reported coordinates. Risk level: HIGH. Priority: 60.','EMERGENCY',0,'2026-10-25 18:48:50'),(93,8,52,'? LANDSLIDE Emergency','New LANDSLIDE incident reported at Reported coordinates. Risk level: HIGH. Priority: 60.','EMERGENCY',0,'2026-10-25 18:48:50'),(94,4,53,'? LANDSLIDE Emergency','New LANDSLIDE incident reported at Reported coordinates. Risk level: HIGH. Priority: 60.','EMERGENCY',0,'2026-10-25 18:49:11'),(95,8,53,'? LANDSLIDE Emergency','New LANDSLIDE incident reported at Reported coordinates. Risk level: HIGH. Priority: 60.','EMERGENCY',0,'2026-10-25 18:49:11'),(96,4,54,'? SECURITY Emergency','New SECURITY incident reported at GVBIJKN. Risk level: LOW. Priority: 20.','WARNING',0,'2026-10-25 19:45:41'),(97,8,54,'? SECURITY Emergency','New SECURITY incident reported at GVBIJKN. Risk level: LOW. Priority: 20.','WARNING',0,'2026-10-25 19:45:41'),(98,4,55,'? SECURITY Emergency','New SECURITY incident reported at GVBIJKN. Risk level: LOW. Priority: 20.','WARNING',0,'2026-10-25 19:45:53'),(99,8,55,'? SECURITY Emergency','New SECURITY incident reported at GVBIJKN. Risk level: LOW. Priority: 20.','WARNING',0,'2026-10-25 19:45:53');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
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
