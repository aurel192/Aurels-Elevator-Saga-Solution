{
    init: function(elevators, floors) {
        time = 0;
        var FloorsUP = [];
        var E1 = elevators[0];
        var E2 = elevators[1];
        var E3 = elevators[2];
        var E4 = elevators[3];          

        var removeDuplicates = function (originalArray, keepOrder) {
            var result = [];
            $.each(originalArray, function(i, e) {
                if ($.inArray(e, result) == -1) result.push(e);
            });
            return result;
        }

        _.each(floors, function(floor) {
            FloorsUP = [];
            floor.on("up_button_pressed", function() {
                FloorsUP.push(floor.floorNum());
                FloorsUP = removeDuplicates(FloorsUP);
                // console.log("FloorsUP  " + FloorsUP);                
            }); 
        });        

        var idleBehavior  = function (elevator) {  
            elevator.goToFloor(Math.floor(Math.random() * 12));
        }  

        var rearrangeDestinationQueue = function (OriginalDestQ, PressedFloors, currentFloor, param) {           
            var array = []; 
            var returnarray = []; 
            var j = 0;
            var change = 0;
            for (var i=1 ; i<=11 ; i++) {
                if ((currentFloor - i) >= 0 )
                    array.push( (currentFloor - i) ); 
                if ((currentFloor + i) <= 11)   
                    array.push( (currentFloor + i) );
            }
            for (var i=0 ; i<=array.length-1 ; i++) {
                for (var j=0 ; j<=PressedFloors.length-1 ; j++) {
                    if (array[i] == PressedFloors[j]) {
                        change++;
                    }
                }            
            }
            if (change) {                
                for (var i=0 ; i<=array.length-1 ; i++) {
                    for (var j=0 ; j<=PressedFloors.length-1 ; j++) {
                        if (array[i] == PressedFloors[j] && change > 0) {
                            returnarray.push( array[i] );
                        }
                    }            
                }                              
            } 
            return returnarray;
        }       

        // Földszintről megy felfelé azokra az emeletekre amiket megnyomtak, lefele nem visz senkit, csak akkor ha felért a legfelső hívott emeletre
        var floorButtonPressedBehavior1 = function (elevator, Floor) {               
            elevator.goingDownIndicator(false);
            elevator.goingUpIndicator(true);
            elevator.destinationQueue = elevator.getPressedFloors();
            elevator.destinationQueue.sort(function(a, b) {
                return a - b;
            });         
            elevator.destinationQueue.push(0);
            elevator.checkDestinationQueue();
            console.log(" E1 Dest Q : " + elevator.destinationQueue);
        }  
        
        // Oda megy ahova küldik
        var floorButtonPressedBehavior2 = function (elevator, Floor) {               
            elevator.goToFloor(Floor);
        } 
        
        // Oda megy ahova küldik, de optimalizált sorrendben
        var floorButtonPressedBehavior3 = function (elevator, floorNum) {
            var NewDestQ = rearrangeDestinationQueue(elevator.destinationQueue, elevator.getPressedFloors(), elevator.currentFloor(), true);
            elevator.destinationQueue = [];
            elevator.destinationQueue = NewDestQ;
            elevator.checkDestinationQueue();        
            console.log("FloorButtonPressed: " + floorNum + " Elevator is on floor: " + elevator.currentFloor() + " DestQ: " + elevator.destinationQueue);
        }

        // Ha elhalad olyan emelet mellett ami benne van a PressedFloorsban akkor stop, DQ átrendezés nélkül, floorButtonPressedBehavior3-al nincs értelme, csak külön
        var passingFloorBehavior  = function (elevator, passFloorNum, direction) {               
            PressedFloors = elevator.getPressedFloors();
            for (var i = 0 ; i < PressedFloors.length ; i++) {                
                if (passFloorNum == PressedFloors[i]) {
                    elevator.goToFloor(passFloorNum,true);
                    console.log(" Passing Floor " + passFloorNum + " PressedFloors  = " + PressedFloors + " DestQ: " + elevator.destinationQueue);    
                }
            }
        }  
        
        var stoppedAtFloorBehavior  = function (elevator, Floor) {               

        }

        // melyik a legközelebb lévő lift, ami nincs tele, és DQ szerint elmegy az adott emelet mellett,
        // ha nincs ilyen akkor a legközelebbi lift kapja meg DQ átrendezés nélkül
        // Ha pl 5.en nyomják meg, és a Lift a 2.-on van, 4.re és 6.ra megy, akkor a DQ legyen 4,5,6 !
        var downButtonPressedOnFloor  = function (floor) {               
            var Dist = 99;
            var NearestElevator = -1;
            for (var i = 1 ; i <= 3 ; i++) {                
                if ( Dist > Math.abs(elevators[i].currentFloor() - floor) && Math.abs(elevators[i].currentFloor() - floor)>0) {
                    Dist = Math.abs(elevators[i].currentFloor() - floor);
                    NearestElevator = i;
                }
            }
            if (NearestElevator != -1  && elevators[NearestElevator].loadFactor() < 0.4) {
                console.log("DOWN Button Pressed on Floor " + floor + "   Dist:" + Dist + " "  + " elevators[" + NearestElevator + "].destinationQueue:" + elevators[NearestElevator].destinationQueue);
                elevators[NearestElevator].goToFloor(floor);                
            }  
        } 
        var upButtonPressedOnFloor  = function (floor) {               
            var Dist = 99;
            var NearestElevator = -1;
            for (var i = 1 ; i <= 3 ; i++) {                
                if ( Dist > Math.abs(elevators[i].currentFloor() - floor) && Math.abs(elevators[i].currentFloor() - floor)>0) {
                    Dist = Math.abs(elevators[i].currentFloor() - floor);
                    NearestElevator = i;
                }
            }
            if (NearestElevator != -1  && elevators[NearestElevator].loadFactor() < 0.4) {
                console.log("UP Button Pressed on Floor " + floor + "   Dist:" + Dist + " "  + " elevators[" + NearestElevator + "].destinationQueue:" + elevators[NearestElevator].destinationQueue);
                elevators[NearestElevator].goToFloor(floor);                
            }  
        } 
        _.each(floors, function(floor) {
            floor.on("up_button_pressed", function() {
                upButtonPressedOnFloor( floor.floorNum() );
            }); 
            floor.on("down_button_pressed", function() {
                downButtonPressedOnFloor( floor.floorNum() );
            });             
        });                 
        // E1.on("floor_button_pressed", function(floorNum) {    
            // floorButtonPressedBehavior1(E1, floorNum);            
        // }); 
        // E2.on("floor_button_pressed", function(floorNum) {    
            // floorButtonPressedBehavior2(E2, floorNum);            
        // });      
        // E3.on("floor_button_pressed", function(floorNum) {    
            // floorButtonPressedBehavior2(E3, floorNum);            
        // }); 
        // E3.on("passing_floor", function(passFloorNum, direction) {  
            // passingFloorBehavior(E3, passFloorNum, direction);     
        // });        
        E4.on("idle", function() {
            console.log(" E4 IDLE ");
            idleBehavior(E4);
        });
        E4.on("floor_button_pressed", function(floorNum) {
            // floorButtonPressedBehavior3(E4, floorNum);            
        });        
        E4.on("passing_floor", function(passFloorNum, direction) {  
            passingFloorBehavior(E4, passFloorNum, direction);     
        });
        E4.on("stopped_at_floor", function(floorNum) {
            // stoppedAtFloorBehavior(E4, floorNum);                 
        });
    },
        update: function(dt, elevators, floors) {
            var updateIndicators = function (elevators, enabled) {              
                for (var i = 0 ; i<=3 && enabled ; i++) {
                    if (elevators[i].destinationDirection() == "up") {
                        elevators[i].goingUpIndicator(true);
                        elevators[i].goingDownIndicator(false);
                    }
                    if (elevators[i].destinationDirection() == "down") {     
                        elevators[i].goingUpIndicator(false);
                        elevators[i].goingDownIndicator(true);
                    }       
                }
            }
            var preventStops = function (elevators, enabled) {
                for (var i = 0 ; i<=3 && enabled ; i++) {
                    if (elevators[i].destinationQueue.length == 0) {
                        console.log("preventStops  ELEVATOR " + i + " STOPPED");
                        elevators[i].goToFloor(Math.floor(Math.random() * 12));    
                    }
                }
            }
            updateIndicators(elevators,false);
            preventStops(elevators,false);
            time = time + dt;            
        }
}

