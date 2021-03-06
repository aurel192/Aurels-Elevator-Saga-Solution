### Aurel's ElevatorSaga Solution

##### This solution was made for Epam's challange hosted on [elevate-me.hu](http://www.elevate-me.hu). 
On [elevate-me.hu](http://www.elevate-me.hu) the challange is to transport as many people in ten minutes as possible.
The current working version of my solution is able to transfer up to 1652 people in 600s. The lowest result is 1564.
Therefore optimization needed to be successful on levels where the waiting time is limited.

![elevate-me.hu](https://github.com/aurel192/Aurels-Elevator-Saga-Solution/blob/master/colortimer.png)

<a href="http://www.youtube.com/watch?feature=player_embedded&v=pBpW-GKweJc
" target="_blank"><img src="http://img.youtube.com/vi/pBpW-GKweJc/0.jpg" 
alt="Elevate Me - Aurels Elevator Saga Soultion" width="320" height="240" border="5" /></a>

Tested on the [Perpetual Demo](http://play.elevatorsaga.com/#challenge=19)
stats:
* Transported/s 1.50
* Avg waiting time 13.4s
* Max waiting time 65.3s
 
Tested on the [Challange Levels](http://play.elevatorsaga.com/#challenge=1)

Level | Success | Fail
------------ | ------------- | ------------
Challange 1 | 10 | 0
Challange 2 | 7 | 3
Challange 3 | 10 | 0
Challange 4 | 9 | 1
Challange 5 | 8 | 2 
Challange 6 | 1 | 9
Challange 7 | 2 | 8
Challange 8 | 10 | 0
Challange 9 | 2 | 8
Challange 10 | 8 | 2
Challange 11 | 1 | 9
Challange 12 | 0 | 10
Challange 13 | 0 | 10
Challange 14 | 0 | 10
Challange 15 | 0 | 10 
Challange 16 | 10 | 0
Challange 17 | 9 | 1
Challange 18 | 0 | 10


##### List Of Functions:
  * updateIndicators
  * removeDuplicates
  * indexOfMax
  * addWaitingFloor
  * showTimers
  * visitFloorWithPriority
  * visitFloor
  * rearrangeDestinationQueue
  * rearrangeByWaitingTime
  * rearrangeByClosestFloors
  * visitNearestFirst
  * nearestFloor
  * idle
  * floorButtonPressed
  * passingFloor
  * stoppedAtFloor
  * SendLeastLoadedElevatorToFloor
  * ButtonPressedOnFloor

