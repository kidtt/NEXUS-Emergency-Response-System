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
-- Table structure for table `incidents`
--

DROP TABLE IF EXISTS `incidents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incidents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text,
  `incident_type` enum('FIRE','FLOOD','EARTHQUAKE','ACCIDENT','LANDSLIDE','MEDICAL','SECURITY','OTHER') NOT NULL,
  `severity` enum('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  `status` enum('REPORTED','VERIFIED','DISPATCHED','IN_PROGRESS','RESOLVED','CLOSED','FALSE_ALARM') NOT NULL DEFAULT 'REPORTED',
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `location_name` varchar(255) DEFAULT NULL,
  `reported_by` int DEFAULT NULL,
  `reported_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `people_affected` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `reported_by` (`reported_by`),
  KEY `idx_incidents_status` (`status`),
  KEY `idx_incidents_type` (`incident_type`),
  KEY `idx_incidents_severity` (`severity`),
  KEY `idx_incidents_reported_at` (`reported_at`),
  CONSTRAINT `incidents_ibfk_1` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incidents`
--

LOCK TABLES `incidents` WRITE;
/*!40000 ALTER TABLE `incidents` DISABLE KEYS */;
INSERT INTO `incidents` VALUES (1,'Fire Emergency','Fire emergency test','FIRE','MEDIUM','VERIFIED',NULL,NULL,'jimma',2,'2026-09-05 18:56:07',NULL,0),(2,'Flood Emergency','hgnb\n\nContact: 0945327958','FLOOD','CRITICAL','REPORTED',NULL,NULL,'debresina',2,'2026-09-05 19:42:15',NULL,0),(3,'Accident Emergency','HJK\n\nContact: 0945327958','ACCIDENT','CRITICAL','REPORTED',NULL,NULL,'ADDIS ABEBA',2,'2026-09-06 22:50:01',NULL,0),(4,'Crime Emergency','ftgjhk,cfkj,m\n\nContact: 0946733612','SECURITY','HIGH','REPORTED',NULL,NULL,'debrebirhan',2,'2026-09-07 17:26:54',NULL,0),(5,'Crime Emergency','ftgjhk,cfkj,m\n\nContact: 0946733612','SECURITY','HIGH','REPORTED',NULL,NULL,'debrebirhan',2,'2026-09-07 17:27:26',NULL,0),(6,'Crime Emergency','ftgjhk,cfkj,m\n\nContact: 0946733612','SECURITY','HIGH','REPORTED',NULL,NULL,'debrebirhan',2,'2026-09-07 17:31:32',NULL,0),(7,'Fire Emergency','k;olv\n\nContact: 0974638812','FIRE','HIGH','REPORTED',NULL,NULL,'j,clk',2,'2026-09-08 14:43:30',NULL,0),(8,'Fire Emergency','k;olv\n\nContact: 0974638812','FIRE','HIGH','REPORTED',NULL,NULL,'j,clk',2,'2026-09-08 14:44:57',NULL,0),(9,'Accident Emergency','jk,bm\n\nContact: 0963456778','ACCIDENT','HIGH','REPORTED',NULL,NULL,'hjkm',2,'2026-09-08 14:46:03',NULL,0),(10,'Accident Emergency','dqas\n\nContact: 0874476552','ACCIDENT','HIGH','REPORTED',NULL,NULL,'kjjkdm',2,'2026-09-08 14:56:22',NULL,0),(11,'Fire Emergency','bhjmbn\n\nContact: -0987t6r4536','FIRE','CRITICAL','REPORTED',NULL,NULL,'gyikhmbn',2,'2026-09-09 11:20:54',NULL,0),(12,'Fire Emergency','bhjmbn\n\nContact: -0987t6r4536','FIRE','CRITICAL','CLOSED',NULL,NULL,'gyikhmbn',2,'2026-09-09 11:21:14','2026-09-22 01:04:53',0),(13,'Fire Emergency','xcvbn\n\nContact: 78987654','FIRE','HIGH','REPORTED',NULL,NULL,'cvbn',9,'2026-09-24 22:39:11',NULL,0),(14,'Fire Emergency','xcvbn\n\nContact: 78987654','FIRE','HIGH','REPORTED',NULL,NULL,'cvbn',9,'2026-09-24 22:40:07',NULL,0),(15,'Accident Emergency','cvbhn\n\nContact: 4567890','ACCIDENT','CRITICAL','REPORTED',NULL,NULL,'dfghj',9,'2026-09-24 22:57:42',NULL,0),(16,'Accident Emergency','cvbhn\n\nContact: 4567890','ACCIDENT','CRITICAL','REPORTED',NULL,NULL,'dfghj',9,'2026-09-24 22:58:02',NULL,0),(17,'Accident Emergency','cvbhn\n\nContact: 4567890','ACCIDENT','CRITICAL','REPORTED',NULL,NULL,'dfghj',9,'2026-09-24 22:58:08',NULL,0),(18,'Accident Emergency','cvbhn\n\nContact: 4567890','ACCIDENT','CRITICAL','DISPATCHED',NULL,NULL,'dfghj',9,'2026-09-24 22:58:27',NULL,0),(19,'Fire Emergency','cvbjhbvcxf','FIRE','MEDIUM','DISPATCHED',NULL,NULL,'bnm',9,'2026-09-24 23:01:03',NULL,0),(20,'Accident Emergency','hvnbh\n\nContact: 098765567','ACCIDENT','HIGH','FALSE_ALARM',NULL,NULL,'cvbnm',9,'2026-09-24 23:01:51',NULL,0),(44,'Flood Emergency','bnm\n\nContact: 876','FLOOD','CRITICAL','REPORTED',NULL,NULL,'hj',2,'2026-10-23 23:02:25',NULL,0),(45,'Flood Emergency','bnm\n\nContact: 876','FLOOD','CRITICAL','REPORTED',NULL,NULL,'hj',2,'2026-10-23 23:02:44',NULL,0),(46,'Flood Emergency','bnm\n\nContact: 876','FLOOD','CRITICAL','REPORTED',NULL,NULL,'hj',2,'2026-10-23 23:02:52',NULL,0),(52,'Landslide Emergency','fhcvy','LANDSLIDE','HIGH','REPORTED',9.1450000,40.4897000,'Reported coordinates',4,'2026-10-25 18:48:32',NULL,0),(53,'Landslide Emergency','fhcvy','LANDSLIDE','HIGH','REPORTED',9.1450000,40.4897000,'Reported coordinates',4,'2026-10-25 18:48:59',NULL,0),(54,'Security Emergency','DXCFVGHJNM','SECURITY','LOW','REPORTED',NULL,NULL,'GVBIJKN',4,'2026-10-25 19:45:04',NULL,0),(55,'Security Emergency','DXCFVGHJNM','SECURITY','LOW','REPORTED',NULL,NULL,'GVBIJKN',4,'2026-10-25 19:45:22',NULL,0);
/*!40000 ALTER TABLE `incidents` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-26 15:25:32
