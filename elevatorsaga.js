{
    init: function(elevators, floors) {
        time = 0;
        NumberOfElevators = 20;
        var UpButtonsPressed = [];
        var DownButtonsPressed = [];
        var E1 = elevators[0];
        var E2 = elevators[1];
        var E3 = elevators[2];
        var E4 = elevators[3];                 

        var updateIndicators = function (enabled, dir, e) {
            for (var i = 0 ; i<=3 && enabled ; i++) {
                if (elevators[i].destinationDirection() == "up") {
                    elevators[i].goingUpIndicator(true);
                    elevators[i].goingDownIndicator(false);
                }
                if (elevators[i].destinationDirection() == "down") {    
                    elevators[i].goingUpIndicator(false);
                    elevators[i].goingDownIndicator(true);
                }
                if (elevators[i].destinationDirection() == "stopped" || dir == "TWOALL") {
                    elevators[i].goingUpIndicator(true);
                    elevators[i].goingDownIndicator(true);
                }
            }  // csak az e paraméterként kapott liftet állítja át, enabled==false mellett is
            if (arguments.length == 3) {
                if (dir == "UP") {
                    e.goingUpIndicator(true);
                    e.goingDownIndicator(false);
                }
                if (dir == "DOWN") {
                    e.goingUpIndicator(false);
                    e.goingDownIndicator(true);
                } 
                if (dir == "TWO") {
                    e.goingUpIndicator(true);
                    e.goingDownIndicator(true);
                } 
                if (dir == "---") {
                    e.goingUpIndicator(false);
                    e.goingDownIndicator(false);
                }  
            }
        }
        
        var removeDuplicates = function (originalArray, sort) {
            var result = [];
            $.each(originalArray, function(i, e) {
                if ($.inArray(e, result) == -1) result.push(e);
            });
            if (sort == "Sort") {
                result.sort(function(a, b) {
                    return a - b;
                });     
            }                   
            return result;
        }

        var updatePressedButtonsList = function (RemoveThisFloor, msg, logparam) {         
            var indexDown = DownButtonsPressed.indexOf(RemoveThisFloor);
            if (indexDown > -1) {
                DownButtonsPressed.splice(indexDown, 1);
            }
            var indexUp = UpButtonsPressed.indexOf(RemoveThisFloor);
            if (indexUp > -1) {
                UpButtonsPressed.splice(indexUp, 1);
            }
            if (logparam == "ShowLog") {
                console.log("DownButtonsPressed: " + DownButtonsPressed + "\tmsg: " + msg);
                console.log("UpButtonsPressed: " + UpButtonsPressed + "\tmsg: " + msg);
            }
        }        
        
        var rearrangeDestinationQueue = function (OriginalDestQ, PressedFloors, currentFloor, logparam) {  
            var array = []; 
            var returnarray = []; 
            var j = 0;
            var change = 0;
            for (var i=1 ; i<=NumberOfElevators ; i++) {
                if ((currentFloor - i) >= 0 )
                    array.push( (currentFloor - i) ); 
                if ((currentFloor + i) <= NumberOfElevators)   
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
            if (logparam == "ShowLog") 
                console.log("     Queue changed from: " + OriginalDestQ + " To: " + returnarray);                        
            return returnarray;
        }          
        
        var idleBehavior  = function (elevator) {  
            elevator.goToFloor(Math.floor(Math.random() * (NumberOfElevators+1)));
        }     
        
        var floorButtonPressedBehavior = function (elevator, FloorBtnPressed, behavior,logparam) {
            updatePressedButtonsList( elevator.currentFloor() , "floorButtonPressed"+FloorBtnPressed+" on Floor"+elevator.currentFloor(), "NO ShowLog" );                                
            switch (behavior) {
                case "GroundFloor": // Földszintről megy felfelé azokra az emeletekre amiket megnyomtak, lefele nem visz senkit, csak akkor ha felért a legfelső hívott emeletre, mert aki fentről megy le úgyis a földszintre megy
                    elevator.destinationQueue = elevator.getPressedFloors();
                    elevator.destinationQueue.sort(function(a, b) {
                        return a - b;
                    });         
                    elevator.destinationQueue.push(0);
                    elevator.checkDestinationQueue();
                    updateIndicators(true, "UP", elevator);
                    break;
                case "FirstComeFirstServe":    // Oda megy ahova küldik
                    elevator.goToFloor(FloorBtnPressed);            
                    updateIndicators(true); //false működik a fel/le jelző, de egy idő utan elakad a lift
                    break;
                case "FirstComeFirstServeRemoveDuplicates": // Oda megy ahova küldik, Destinationqueue duplikációk nélkül                    
                    elevator.goToFloor(FloorBtnPressed);
                    elevator.destinationQueue = removeDuplicates( elevator.destinationQueue ,"DoNOTSort")
                    elevator.checkDestinationQueue(); 
                    updateIndicators(true);                    
                    break;
                case "Reorganize": // Oda megy ahova küldik, de optimalizált sorrendben
                    elevator.destinationQueue = rearrangeDestinationQueue(elevator.destinationQueue, elevator.getPressedFloors(), elevator.currentFloor(), "NO ShowLog");
                    elevator.checkDestinationQueue();     
                    updateIndicators(true,"TWOALL");     // Jó ez csak beszáll mindenki, az is akinek nemkéne                
                    break;
                case "SortPlusGroundFloor":
                    break;
                default:   // "FirstComeFirstServe":  Oda megy ahova küldik
                    elevator.goToFloor(FloorBtnPressed);
            } 
            if (logparam == "ShowLog")
                console.log("floorButtonPressed(" + behavior + "," + FloorBtnPressed + ")  Queue: " + elevator.destinationQueue + " Elevator is at floor " + elevator.currentFloor());                      
        }        
        
        var passingFloorBehavior  = function (elevator, passFloorNum, direction, logparam) { 
            var PressedFloors = elevator.getPressedFloors();
            for (var i = 0 ; i < PressedFloors.length ; i++) {                
                if (passFloorNum == PressedFloors[i]) {  // Ha olyan emelet mellett megy el a lift, ami megnyomott gomb akkor egyből odamegy
                    // updateIndicators(true,false);
                    // elevator.goToFloor(passFloorNum,true);
                    if (logparam == "ShowLog") 
                        console.log("Passing Floor " + passFloorNum + ". Direction:" + direction + ". PressedFloors: " + PressedFloors + " \t Queue: " + elevator.destinationQueue);    
                }
            }                        
        }
        
        var stoppedAtFloorBehavior  = function (elevator, Floor, logparam) {           
            updateIndicators(true, "TWO");  
            updatePressedButtonsList( Floor , "stoppedAtFloor"+Floor, "ShowLog NOOOO" );
            if (logparam == "ShowLog")
                console.log("Elevator stopped at floor " + Floor);            
        }

        // melyik a legközelebb lévő lift, ami nincs tele, és DQ szerint elmegy az adott emelet mellett,
        // ha nincs ilyen akkor a legközelebbi lift kapja meg DQ átrendezés nélkül. direction is számít
        // Ha pl 5.en nyomják meg, és a Lift a 2.-on van, 4.re és 6.ra megy, akkor a DQ legyen 4,5,6 !
        var ButtonPressedOnFloor  = function (floor, UpOrDownBtn, maxLoad, sendImmediately, logparam) {           
            var Dist = 99;
            var NearestElevator = -1;
            for (var i = 0 ; i <= 3 ; i++) {                
                if ( Dist > Math.abs(elevators[i].currentFloor() - floor) && Math.abs(elevators[i].currentFloor() - floor)>0) {
                    Dist = Math.abs(elevators[i].currentFloor() - floor);
                    NearestElevator = i;
                }
            }
            if (UpOrDownBtn == "up_button_pressed") {
                if (logparam == "ShowLog" || logparam == "ShowEverything") 
                    console.log("Up Button Pressed on Floor " + floor + "   UpButtonsPressed: " + UpButtonsPressed);             
                if (NearestElevator != -1  &&  elevators[NearestElevator].loadFactor() < maxLoad) {
                    if (logparam == "ShowEverything") 
                        console.log("Up Button Pressed on Floor " + floor + "   Dist:" + Dist + " "  + " elevators[" + NearestElevator + "].destinationQueue:" + elevators[NearestElevator].destinationQueue + "\nUpButtonsPressed: " + UpButtonsPressed);                
                    if (sendImmediately) {
                        updateIndicators(true, "UP", elevators[NearestElevator]); 
                        elevators[NearestElevator].goToFloor(floor, true);        
                    }                        
                    else
                        elevators[NearestElevator].goToFloor(floor);                                            
                }
                UpButtonsPressed.push(floor);
                UpButtonsPressed = removeDuplicates(UpButtonsPressed,"Sort");                                   
            }   
            if (UpOrDownBtn == "down_button_pressed") {
                if ( (logparam == "ShowLog" || logparam == "ShowEverything") && NearestElevator == -1) 
                    console.log("Down Button Pressed on Floor " + floor + "   DownButtonsPressed: " + DownButtonsPressed);             
                if (NearestElevator != -1  &&  elevators[NearestElevator].loadFactor() < maxLoad) {
                    if (logparam == "ShowEverything") 
                        console.log("Down Button Pressed on Floor " + floor + "   Dist:" + Dist + " "  + " elevators[" + NearestElevator + "].destinationQueue:" + elevators[NearestElevator].destinationQueue + "\nDownButtonsPressed: " + DownButtonsPressed);                
                    if (sendImmediately) {
                        updateIndicators(true, "DOWN", elevators[NearestElevator]);                 
                        elevators[NearestElevator].goToFloor(floor, true);                                                    
                    }
                    else
                        elevators[NearestElevator].goToFloor(floor);                      
                }
                DownButtonsPressed.push(floor);
                DownButtonsPressed = removeDuplicates(DownButtonsPressed,"Sort");    
            }       
        }        
    
        _.each(floors, function(floor) {
            floor.on("down_button_pressed", function() {
                ButtonPressedOnFloor( floor.floorNum(), "down_button_pressed", 0.3, false, "NONONO ShowEverything" );
            });             
            floor.on("up_button_pressed", function() {
                ButtonPressedOnFloor( floor.floorNum(), "up_button_pressed", 0.3, false, "NONONO ShowEverything" );
            });             
        });          
        _.each(elevators, function(elevator) {
            elevator.on("idle", function() {
                idleBehavior(elevator, "ShowLog");
            });
            elevator.on("floor_button_pressed", function(floorNum) {
                floorButtonPressedBehavior(elevator, floorNum, "Reorganize", "ShowLog");
            });
            elevator.on("passing_floor", function(passFloorNum, direction) {
                passingFloorBehavior(elevator, passFloorNum, direction, "ShowLog");   
            });
            elevator.on("stopped_at_floor", function(floorNum) {
                stoppedAtFloorBehavior(elevator, floorNum, "ShowLog");     
            });           
        });           
    },
    
    update: function(dt, elevators, floors) {
        var removeDuplicates = function (originalArray, sort) {
            var result = [];
            $.each(originalArray, function(i, e) {
                if ($.inArray(e, result) == -1) result.push(e);
            });
            if (sort == "Sort") {
                result.sort(function(a, b) {
                    return a - b;
                });     
            }                   
            return result;
        }
        time = time + dt;    
        var UseAllElevators = true;
        if (!UseAllElevators) {
            elevators[0].stop();
            elevators[1].stop();
            elevators[2].stop();
        }
        
        // Transported 3439
        // Elapsed time 2317s
        // Transported/s 1.48
        // Avg waiting time 17.3s
        // Max waiting time 132.0s
        // Moves 27609
            // for (var i = 0 ; i <= 3 ; i++) {
                // if (elevators[i].loadFactor() > 0.8 ) {
                    // console.log("TELE VAN A LIFT!!!!!!!!!!!!!!!! " + i + "  "+elevators[i].loadFactor());
                    // for ( var j=11 ; j>=0 ; j--) {
                        // elevators[i].goToFloor(j,true);
                        // elevators[i].goingUpIndicator(false);
                        // elevators[i].goingDownIndicator(false);
                    // }
                // }
            // }            
    }
}

