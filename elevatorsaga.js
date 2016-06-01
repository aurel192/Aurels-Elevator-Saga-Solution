{
    init: function(elevators, floors) {
        time = 0;
        var E1 = elevators[0];
        var E2 = elevators[1];
        var E3 = elevators[2];
        var E4 = elevators[3];  
        
        var upFloors = [];
        // var downFloors = {};
        // for(var floorNum in floors){
            // upFloors[floorNum] = 0;
            // downFloors[floorNum] = 0;
        // }
        // for(var floorNum in floors){
            // registerUpButtonPressed(floors[floorNum]);
        // }
        // function registerUpButtonPressed(floor) {
            // floor.on("up_button_pressed", function() { 
                // addEntryFloor(upFloors, floor.floorNum());
            // });
            // console.log(" UP        upFloors:" + upFloors);
        // }
        // function addEntryFloor(floorMap, floorNum){
            // floorMap[floorNum]++;
        // }
        
        // var rotator = 0;
        // _.each(floors, function(floor) {
            // FloorsUP = [];
            // floor.on("up_button_pressed", function() {
                // var elevator = elevators[(rotator++) % elevators.length];
                // elevator.goToFloor(floor.level);
                // FloorsUP.push(floor.floorNum());
                // console.log(" UP " + floor.floorNum() + "   FloorsUP:" + FloorsUP);
            // }); 
        // });        
        
        // function registerUpButtonPressed(floor) {
            // console.log(" UP ============== UP ");
            // floor.on("up_button_pressed", function() { 
                //addEntryFloor(upFloors, floor.floorNum());                
                // console.log(" UP " + floor.floorNum() );
            // });
        // }        
        
        floors.forEach(function(f) {
            f.on("up_button_pressed", function() {
                upFloors.push( f.floorNum() );
                console.log("f.floorNum() : " + f.floorNum() + " upFloors: " + upFloors);
            });
        });
        
        // floors.forEach( asd(f) );
        
        // function asd(f) {
            // f.on("up_button_pressed", function() {
                // upFloors.push( f.floorNum() );
                // console.log("f.floorNum() : " + f.floorNum() + " upFloors: " + upFloors);
            // });
        // }
        
        
        var idleBehavior  = function (elevator) {  
            elevator.goToFloor(Math.floor(Math.random() * 12));
        }  
        
        // function idleBehavior2(elevator) {  
            // elevator.goToFloor(Math.floor(Math.random() * 12));
        // }  

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
        
        var floorButtonPressedBehavior1 = function (elevator, Floor) {               
            elevator.goToFloor(Floor);
        }  
        
        var floorButtonPressedBehavior2 = function (elevator, floorNum) {
            var NewDestQ = rearrangeDestinationQueue(elevator.destinationQueue, elevator.getPressedFloors(), elevator.currentFloor(), true);
            elevator.destinationQueue = [];
            elevator.destinationQueue = NewDestQ;
            elevator.checkDestinationQueue();        
            console.log("FloorButtonPressed: " + floorNum + " DestQ:" + elevator.destinationQueue);
        }
 
        var passingFloorBehavior  = function (elevator, passFloorNum, direction) {               

        }  
        
        var stoppedAtFloorBehavior  = function (elevator, Floor) {               
            
        }          

        // melyik a legközelebb lévő lift, ami nincs tele, és DQ szerint elmegy az adott emelet mellett,
        // ha nincs ilyen akkor a legközelebbi lift kapja meg DQ átrendezés nélkül
        // Ha pl 5.en nyomják meg, és a Lift a 2.-on van, 4.re és 6.ra megy, akkor a DQ legyen 4,5,6 !
        

        
        floors[0].on("up_button_pressed", function() {
            var FL = 0;
            var Dist = -1;
            var NearestElevator = -1;
            for (var i = 0 ; i <= 3 ; i++) {
                if( elevators[i].currentFloor() - FL  > 0) {
                    Dist = elevators[i].currentFloor() - FL;
                    NearestElevator = i;
                }
                if( FL - elevators[i].currentFloor() > 0) {
                    Dist = FL - elevators[i].currentFloor();
                    NearestElevator = i;
                }
            }
            if (NearestElevator != -1) {
                console.log("UP Button Pressed on Floor " + FL + "   Dist:" + Dist + " "  + " elevators[" + NearestElevator + "].destinationQueue:" + elevators[NearestElevator].destinationQueue);
                elevators[NearestElevator].goToFloor(FL,true);                
            }            
        });  
        E1.on("floor_button_pressed", function(floorNum) {    
            floorButtonPressedBehavior1(E1, floorNum);            
        }); 
        E2.on("floor_button_pressed", function(floorNum) {    
            floorButtonPressedBehavior1(E2, floorNum);            
        });      
        E3.on("floor_button_pressed", function(floorNum) {    
            floorButtonPressedBehavior1(E3, floorNum);            
        }); 
        E4.on("idle", function() {
            idleBehavior(E4);
        });
        E4.on("floor_button_pressed", function(floorNum) {    
            floorButtonPressedBehavior2(E4, floorNum);            
        });        
        E4.on("passing_floor", function(passFloorNum, direction) {  
            passingFloorBehavior(E4, passFloorNum, direction);     
        });
        E4.on("stopped_at_floor", function(floorNum) {
            stoppedAtFloorBehavior(E4, floorNum);                 
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
            updateIndicators(elevators,false);
            time = time + dt;            
        }
}

