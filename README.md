# SpaceLogic Error Log Report

## Overview

HTML Error Log report of SpaceLogic MP, RP, and IP-IO series controllers for Schneider Electric's EcoStruxure Building Operation WebClient.

## Installation

Load into a html utility object in a Server with the BACnet Interface to run the report on. 

## Operation

On opening it will 
* scan the local server for BACnet interface in the root path of the server. 
* will scan the interface for IP Networks 
* search each network for SpaceLogic Controllers (MP, RP,  and IP)
* read the error log file
* generate a unified error log report table with information from all the controllers. 






