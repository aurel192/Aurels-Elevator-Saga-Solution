{
    init: function(elevators, floors) {
        time = 0;
        NumberOfElevators = 4;
        NumberOfFloors = 12;
        longestWaitingFloorUp = 0;
        longestWaitingFloorDn = 0;
        var waitingFloorsUp = [];
        var waitingFloorsDn = [];
        var UpButtonsPressed = [];
        var DnButtonsPressed = [];               

        var updateIndicators = function (enabled, dir, e) {
            for (var i = 0 ; i<=NumberOfElevators && enabled ; i++) {
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
            var indexDown = DnButtonsPressed.indexOf(RemoveThisFloor);
            if (indexDown > -1) {
                DnButtonsPressed.splice(indexDown, 1);
            }
            var indexUp = UpButtonsPressed.indexOf(RemoveThisFloor);
            if (indexUp > -1) {
                UpButtonsPressed.splice(indexUp, 1);
            }
            if (logparam == "ShowLog") {
                console.log("DnButtonsPressed: " + DnButtonsPressed + "\tmsg: " + msg);
                console.log("UpButtonsPressed: " + UpButtonsPressed + "\tmsg: " + msg);
            }
        }  
        
        var indexOfMax = function(arr) {
            if (arr.length === 0) {
                return -1;
            }
            var max = arr[0];
            var maxIndex = 0;
            for (var i = 1; i < arr.length; i++) {
                if (arr[i] > max) {
                    maxIndex = i;
                    max = arr[i];
                }
            }
            return maxIndex;
        }

        var rearrangeDestinationQueue = function (OriginalDestQ, PressedFloors, currentFloor, logparam) {          
            var array = []; 
            var ret = []; 
            var j = 0;
            var change = 0;
            for (var i=0 ; i<=NumberOfFloors ; i++) {
                if ((currentFloor - i) >= 0 )
                    array.push( (currentFloor - i) ); 
                if ((currentFloor + i) <= NumberOfFloors)   
                    array.push( (currentFloor + i) );
            }
            for (var i=0 ; i<=array.length-1 ; i++) {
                for (var j=0 ; j<=PressedFloors.length-1 ; j++) {
                    if (array[i] == PressedFloors[j]) {
                        change++;
                        break;
                    }
                }            
            }             
            for (var i=0 ; change && i<=array.length-1 ; i++) {
                for (var j=0 ; j<=PressedFloors.length-1 ; j++) {
                    if (array[i] == PressedFloors[j] && change > 0) {
                        ret.push( array[i] );
                    }
               }            
            }                              
            if (logparam == "ShowLog") 
                console.log("Queue changed from: " + OriginalDestQ + " To: " + returnarray);                        
            return ret;
        }          
        
        var checkWaitingFloors = function (calledFromFloor, UpOrDownBtn, logparam) {
            if (UpOrDownBtn == "up_button_pressed")
                waitingFloorsUp[calledFromFloor] = time;
            if (UpOrDownBtn == "down_button_pressed")
                waitingFloorsDn[calledFromFloor] = time; 
            longestWaitingFloorUp = indexOfMax(waitingFloorsUp);
            longestWaitingFloorDn = indexOfMax(waitingFloorsDn);
            if (logparam == "ShowLog" )
                console.log("==========================================");
            for (var i=NumberOfFloors-1 ; i>=0 ; i--) {
                if (logparam == "ShowLog" ) 
                    console.log("Waiting on Floor " + i + ". \tUP: " + (time-waitingFloorsUp[i]).toFixed() + "\tDOWN: " + (time-waitingFloorsDn[i]).toFixed() );
            }
            if (logparam == "ShowLog" )
                console.log("longestWaitingFloorUp:" + longestWaitingFloorUp + " longestWaitingFloorDn:" + longestWaitingFloorDn);
        }
        
        var idleBehavior = function (elevator) {  
            elevator.goToFloor(Math.floor(Math.random() * (NumberOfFloors+1)));
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
            updatePressedButtonsList( Floor , "stoppedAtFloor" + Floor, "ShowLog NOOOO" );
            waitingFloorsUp[Floor] = 0;  // Később majd csak akkor kell nullázni, ha arra ment a lift, és elis vitte a várakozókat
            waitingFloorsDn[Floor] = 0;
            if (logparam == "ShowLog")
                console.log("Elevator stopped at floor " + Floor);
        }

        // melyik a legközelebb lévő lift, ami nincs tele, és DQ szerint elmegy az adott emelet mellett,
        // ha nincs ilyen akkor a legközelebbi lift kapja meg DQ átrendezés nélkül. direction is számít
        // Ha pl 5.en nyomják meg, és a Lift a 2.-on van, 4.re és 6.ra megy, akkor a DQ legyen 4,5,6 !
        var ButtonPressedOnFloor  = function (floor, UpOrDownBtn, maxLoad, sendImmediately, logparam) {     
            checkWaitingFloors(floor, UpOrDownBtn, "ShowLog");
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
                    console.log("Down Button Pressed on Floor " + floor + "   DnButtonsPressed: " + DnButtonsPressed);             
                if (NearestElevator != -1  &&  elevators[NearestElevator].loadFactor() < maxLoad) {
                    if (logparam == "ShowEverything") 
                        console.log("Down Button Pressed on Floor " + floor + "   Dist:" + Dist + " "  + " elevators[" + NearestElevator + "].destinationQueue:" + elevators[NearestElevator].destinationQueue + "\nDnButtonsPressed: " + DnButtonsPressed);                
                    if (sendImmediately) {
                        updateIndicators(true, "DOWN", elevators[NearestElevator]);                 
                        elevators[NearestElevator].goToFloor(floor, true);                                                    
                    }
                    else
                        elevators[NearestElevator].goToFloor(floor);                      
                }
                DnButtonsPressed.push(floor);
                DnButtonsPressed = removeDuplicates(DnButtonsPressed,"Sort");    
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
                idleBehavior(elevator, "NShowLog");
            });
            elevator.on("floor_button_pressed", function(floorNum) {
                floorButtonPressedBehavior(elevator, floorNum, "Reorganize", "NShowLog");
            });
            elevator.on("passing_floor", function(passFloorNum, direction) {
                passingFloorBehavior(elevator, passFloorNum, direction, "NShowLog");   
            });
            elevator.on("stopped_at_floor", function(floorNum) {
                stoppedAtFloorBehavior(elevator, floorNum, "NShowLog");     
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
    }
}

