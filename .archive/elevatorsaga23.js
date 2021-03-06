{
    init: function(elevators, floors) {
        timer = 0;
        var counter = 0;
        var NumberOfElevators = elevators.length;
        var NumberOfFloors = floors.length;
        console.log(NumberOfElevators + " " + NumberOfFloors);
        var longestWaitingFloorUp = 0;
        var longestWaitingFloorDn = 0;   
        var arraySize = 1000;     
        var waitingFloorsUp = [];
        var waitingFloorsDn = [];
        var UpButtonsPressed = [];
        var DnButtonsPressed = [];        

        var Array2D = function(numrows, numcols, initial){
           var arr = [];
           for (var i = 0; i < numrows; ++i){
              var columns = [];
              for (var j = 0; j < numcols; ++j){
                 columns[j] = initial;
              }
              arr[i] = columns;
            }
            return arr;
        }
        var passingersWeightInElevators = Array2D(arraySize,NumberOfElevators,0); // [counter][NumberOfElevators] = PassengersInElevator       
        var waitingInsideElevators = Array2D(NumberOfElevators,NumberOfFloors,-1); // waitingInsideElevators[2][11] == 20;  A harmadik liftben 11. emeletre 20mp-e várnak

        var updateIndicators = function (enabled, dir, e) {
            for (var i = 0 ; i<NumberOfElevators && enabled ; i++) {
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

        var listPassangersWeightInElevator = function(elevatorNumber, msg, logparam) {      
            var prevEntries = 0;
            for (var e = 0 ; logparam == "ShowEverything" && e < NumberOfElevators ; e++) {
                    console.log("listPassangersWeightInElevator " + e);
                for (var c = (counter)-20 ; (counter) > 25 && c <= (counter) ; c++ ) {                  
                    if (passingersWeightInElevators[c][e]>0) {                        
                        console.log("PassengersInElevator[" + c + "][" + e + "]=" + passingersWeightInElevators[c][e].toFixed(2) );  
                        if (prevEntries++ > 2)
                            break;                            
                    }                    
                }
            }
            var prevLoad = 0;
            var currLoad = 0;
            for (var c = counter ; c>0 ; c-- ) {                      
                if(currLoad==0 && passingersWeightInElevators[c][elevatorNumber]>0){
                    currLoad = passingersWeightInElevators[c][elevatorNumber];
                    continue;
                }
                if (prevLoad==0 && passingersWeightInElevators[c][elevatorNumber]>0 && currLoad!=0) {
                    prevLoad = passingersWeightInElevators[c][elevatorNumber];                
                    break;
                }
            }
            if (logparam=="ShowLog" || logparam=="ShowEverything")
                console.log("Elevator " + elevatorNumber + " getIn/getOff " + (currLoad-prevLoad).toFixed(2) + "  prevLoad:" + prevLoad.toFixed(2) + " currLoad:" + currLoad.toFixed(2) + " " + msg);
            // Az utolsó 5-20 értékből a legkisebbet vagy a legnagyobbat kell kiválasztani, mert egyszerre sokan nyomják meg a gombot.
            // de azt a hívó függvénynek kell kiválogatni az utolsó értékekböl, annyiból ahány emelet van.   return currLoad-prevLoad;
            //console.log("avgWaitTime:" + avgWaitTime + "  maxWaitTime:" + maxWaitTime + " moveCount:" + moveCount + " transportedCounter:" + transportedCounter);
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
                if ((timer-arr[i]) > max) {
                    maxIndex = i;
                    max = (timer-arr[i]);
                }
            }
            return maxIndex;
        }

        var checkWaitingFloors = function (calledFromFloor, UpOrDownBtn, logparam) {
            if (UpOrDownBtn == "up_button_pressed")
                waitingFloorsUp[calledFromFloor] = timer;
            if (UpOrDownBtn == "down_button_pressed")
                waitingFloorsDn[calledFromFloor] = timer; 
            longestWaitingFloorUp = indexOfMax(waitingFloorsUp);
            longestWaitingFloorDn = indexOfMax(waitingFloorsDn);
            if (logparam == "ShowLog" )
                console.log("==========================================");
            for (var i=NumberOfFloors-1 ; i>=0 ; i--) {
                if (logparam == "ShowLog" ) {
                    if (i==NumberOfFloors-1)
                        console.log("Waiting on Floor " + i + ".            DOWN: " + (timer-waitingFloorsDn[i]).toFixed() );                
                    if (i==0)
                        console.log("Waiting on Floor " + i + ". \tUP: " + (timer-waitingFloorsUp[i]).toFixed());                
                    else
                        console.log("Waiting on Floor " + i + ". \tUP: " + (timer-waitingFloorsUp[i]).toFixed() + "\tDOWN: " + (timer-waitingFloorsDn[i]).toFixed() );                                
                }
            }
            if (logparam == "ShowLog" )
                console.log("longestWaitingFloorUp " + longestWaitingFloorUp + ": " + (timer-waitingFloorsUp[longestWaitingFloorUp]).toFixed() + "s \t longestWaitingFloorDn:" + longestWaitingFloorDn + ": " + (timer-waitingFloorsDn[longestWaitingFloorDn]).toFixed() + "s");
        }
        
        var idleBehavior = function (elevator, elevatorNumber, logparam) {  
            elevator.goToFloor(Math.floor(Math.random() * (NumberOfFloors+1)));
            if (logparam == "ShowLog" )
                console.log(" Elevator "  + elevatorNumber + " was Idle");            
        }     
        
        var listWaitingInsideElevator = function(e) {
            for (var f=0 ; f<NumberOfFloors; f++) {
                if (waitingInsideElevators[e][f] != -1)
                    console.log("Passangers in Elevator " + e + " are waiting for Floor " + f + " for " + (timer-waitingInsideElevators[e][f]).toFixed() + "s")    
            }
        }

        var floorButtonPressedBehavior = function (elevator, elevatorNumber, FloorBtnPressed, behavior, logparam) {            
            updatePressedButtonsList( elevator.currentFloor() , "floorButtonPressed"+FloorBtnPressed+" on Floor"+elevator.currentFloor(), "NO ShowLog" );                                
            waitingInsideElevators[elevatorNumber][FloorBtnPressed] = timer;         
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
                case "UpDown":  // Az alsó és felső emelet között mozog minden lift, és megáll az olyan emeleteknél ahol hívták (és közel van ~1táv), meg ahova küldték
                    if (elevator.currentFloor() == NumberOfFloors-1)
                        elevator.goToFloor(0,true);
                    if (elevator.currentFloor() == 0)
                        elevator.goToFloor(NumberOfFloors-1,true);
                    // elevator.destinationQueue.push(FloorBtnPressed);
                    // elevator.destinationQueue = removeDuplicates(elevator.destinationQueue, "Sort");
                    // elevator.checkDestinationQueue();
                    // var PressedFloors = elevator.getPressedFloors();
                    // elevator.destinationQueue = [];                
                    // for (var i=0 ; i<NumberOfFloors ; i++)
                    //     if (i == PressedFloors[i])
                    //     elevator.destinationQueue.push(i); 
                    // elevator.checkDestinationQueue();
                    break;
                case "SortPlusGroundFloor":
                    break;                    
                default:   // "FirstComeFirstServe":  Oda megy ahova küldik
                    elevator.goToFloor(FloorBtnPressed);
            }
            passingersWeightInElevators[counter][elevatorNumber] = elevator.loadFactor();
            if (counter++ > arraySize-50)
                counter=0;            
            if (logparam == "ShowLog") 
                console.log("FloorButtonPressed(" + behavior + "," + FloorBtnPressed + ")  Queue: " + elevator.destinationQueue + " Elevator " + elevatorNumber + " is at floor " + elevator.currentFloor());                      
            listPassangersWeightInElevator(elevatorNumber, "FloorButtonPressed",  "ShowLog");
        }
        
        var passingFloorBehavior  = function (elevator, elevatorNumber, passFloorNum, direction, logparam) {    
           // listWaitingInsideElevator(3);
            var PressedFloors = elevator.getPressedFloors();
            for (var i = 0 ; i < PressedFloors.length ; i++) {                
                if (passFloorNum == PressedFloors[i]  &&  elevator.loadFactor() < 0.4) {  // Ha olyan emelet mellett megy el a lift, ami megnyomott gomb akkor egyből odamegy, Reorganize mellett nincs értelme
                    var heading = elevator.destinationQueue[0];
                    elevator.stop();
                    elevator.destinationQueue.push(heading);
                    elevator.checkDestinationQueue();
                    if (logparam == "ShowLog") 
                        console.log("Elevator " + elevatorNumber + " Passing Floor " + passFloorNum + ". Direction:" + direction + ". PressedFloors: " + PressedFloors + " \t Queue: " + elevator.destinationQueue);    
                }
            }                        
        }
                       
        var stoppedAtFloorBehavior  = function (elevator, elevatorNumber, Floor, logparam) {
            updateIndicators(true, "TWO");  
            updatePressedButtonsList(Floor , "stoppedAtFloor " + Floor, "ShowLog NOOOO" );
            if (waitingInsideElevators[elevatorNumber][Floor] != -1) {
                if ("ShowLog")
                    console.log("Passangers in elevator " + elevatorNumber + " delivered to floor " + Floor + " in " + waitingInsideElevators[elevatorNumber][Floor] + "s");
            }
            waitingInsideElevators[elevatorNumber][Floor] = -1;
            waitingFloorsUp[Floor] = -1;  // Később majd csak akkor kell nullázni, ha arra ment a lift, és elis vitte a várakozókat
            waitingFloorsDn[Floor] = -1;
            passingersWeightInElevators[counter][elevatorNumber] = elevator.loadFactor();
            if (counter++ > arraySize-50)
                counter=0;
            if (logparam == "ShowLog")
                console.log("Elevator " + elevatorNumber + " stopped at floor " + Floor + "\tloadFactor:" + elevator.loadFactor().toFixed(2));
            listPassangersWeightInElevator(elevatorNumber, "Elevator Stopped", "ShowLog");           
        }

        var ButtonPressedOnFloor  = function (floor, UpOrDownBtn, maxLoad, sendImmediately, logparam) {              
            checkWaitingFloors(floor, UpOrDownBtn, "DO NOT ShowLog");
            var Dist = 99;
            var NearestElevator = -1;
            for (var i = 0 ; i < NumberOfElevators ; i++) {                
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

        _.each(elevators, function(elevator,index) {
            elevator.on("idle", function() {
                idleBehavior(elevator, "NShowLog");
            });
            elevator.on("floor_button_pressed", function(floorNum) {
                floorButtonPressedBehavior(elevator, index, floorNum, "Reorganize", "NOShowLog");
            });
            elevator.on("passing_floor", function(passFloorNum, direction) {
                passingFloorBehavior(elevator, index, passFloorNum, direction, "NShowLog");   
            });
            elevator.on("stopped_at_floor", function(floorNum) {
                stoppedAtFloorBehavior(elevator, index, floorNum, "NShowLog");     
            });            
        });              

        _.each(floors, function(floor) {
            floor.on("down_button_pressed", function() {
                ButtonPressedOnFloor( floor.floorNum(), "down_button_pressed", 0.3, false, "NONONO ShowEverything" );
            });             
            floor.on("up_button_pressed", function() {
                ButtonPressedOnFloor( floor.floorNum(), "up_button_pressed", 0.3, false, "NONONO ShowEverything" );
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
        timer = timer + dt;            
        var UseAllElevators = true;
        for (var i = 0 ; !UseAllElevators && i<elevators.length-1 ; i++) 
            elevators[i].stop();
    }
}