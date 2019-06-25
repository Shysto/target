-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le :  ven. 21 juin 2019 à 15:22
-- Version du serveur :  5.7.23
-- Version de PHP :  7.2.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `target`
--

-- --------------------------------------------------------

--
-- Structure de la table `chat`
--

DROP TABLE IF EXISTS `chat`;
CREATE TABLE IF NOT EXISTS `chat` (
  `idMessage` int(11) NOT NULL AUTO_INCREMENT,
  `loginAuteur` varchar(12) NOT NULL,
  `message` text NOT NULL,
  PRIMARY KEY (`idMessage`),
  KEY `chat_ibfk_1` (`loginAuteur`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=latin1 COMMENT='Informations concernant le chat du jeu';

--
-- Déchargement des données de la table `chat`
--

INSERT INTO `chat` (`idMessage`, `loginAuteur`, `message`) VALUES
(1, 'eve', 'Salut, vous voulez bien faire une partie?'),
(2, 'nathan', 'Oui pourquoi pas!'),
(3, 'tanguy', 'Je suis partant aussi !'),
(4, 'rony', 'Salut comment ça va?'),
(5, 'samuel', 'Bien et toi? On joue?');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `login` varchar(12) NOT NULL,
  `password` varchar(12) NOT NULL,
  `isAdmin` tinyint(1) NOT NULL COMMENT '0 = false, 1 = true',
  `isBlacklisted` tinyint(1) NOT NULL COMMENT '0 = false, 1 = true',
  `highScore` smallint(5) UNSIGNED NOT NULL,
  PRIMARY KEY (`login`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Informations sur les joueurs';

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`login`, `password`, `isAdmin`, `isBlacklisted`, `highScore`) VALUES
('eve', 'leg', 0, 0, 0),
('rony', 'abe', 0, 0, 0),
('nathan', 'boy', 0, 0, 0),
('tanguy', 'nav', 1, 0, 0),
('samuel', 'cha', 1, 0, 0);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
