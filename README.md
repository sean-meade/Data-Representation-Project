This repository contains my project submission for the module Data Representation in GMITs H.Dip in data analytics.

currently hosted at (check note before using): https://seanmeade.pythonanywhere.com/
note: pythonanywhere doesn't allow threading and therefore the weather information part won't work. I am looking at hosting it somewhere else that does support it.

## Introduction

The project was to assess (as of the first page of the *Project Description.pdf*):
- An understanding of REST API (25%).
- Consuming a REST API (15%).
- Creating a web interface (10%.)
- Elaborating on one or more of these areas (50%)

My web app trys to solve two main problems runners have when training regularly and increasing their mileage each week:

1. Where do I need to run to in order to make up my mileage for a given day.

2. What is the weather going to be like on the date and time I have decided to go for a run.

Using Google maps requires you to choose a route before submitting to see the distance of it. Then you have to go somewhere else to see the weather information for the date and time of your run. My plan with this app was to make something that put this information in one nice easy window.

## Method

### Building map
I used MapBox to display the map and its API to request a geoJSON feature which I parse to grab the route and the distance of the route.

### Building weather output
I used Met Éireanns API to request the weather information and then parsed it for the relevant values.

## How to Use
There are three columns underneath the map. 

![image of plan my run](static/img/plan_my_run.png)


1. Choose click (auto is in developement)
The automatic route option is terrible at making an a route. My plan is for a user to give the distance of the run they want and when you click the submit button it will produce it. The clickable route, when activated, allows you to click the route you want and displays the distance after each click. The users current location is the start and finish of a route.

2. Day and time to check weather
This uses the date and time given and the users current location to give weather information. When button is clicked it updates the *Weather information* column.

3. Weather information:
Simply displays the information of the request made by the "Check Weather" button.

## Things to work on:

- obviously the method of automatically producing a route needs a lot of work. 
- put clickable as default.
- make it possible to choose the location to start or choose your current location.
- create a file holding the weather parsing in Python and import into Plan_My_Run.py to make it tidier.