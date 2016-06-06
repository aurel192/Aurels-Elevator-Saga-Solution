{
    init: function(elevators, floors) {
        interval = 2;        
        shown = 0;
        timer = 0;
        counter = 0;        
        console.log(elevators.length + " " + floors.length);
        longestWaitingFloorUp = 0;
        longestWaitingFloorDn = 0;   
        arraySize = 1000;     
        waitingFloorsUp = [];
        waitingFloorsDn = [];      
        maxWaitingInElevator = 0;
        maxWaitingForElevator = 0;

        Array2D = function(numrows, numcols, initial){
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
        passingersWeightInElevators = Array2D(arraySize,elevators.length,0); // [counter][elevators.length] = PassengersInElevator       
        waitingInsideElevators = Array2D(elevators.length,floors.length,-1); // waitingInsideElevators[2][11] == 20;  A harmadik liftben 11. emeletre 20mp-e várnak

        updateIndicators = function (enabled, dir, e) {
            for (var i = 0 ; i<elevators.length && enabled ; i++) {
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

        listPassengersWeightInElevator = function(elevatorNumber, msg, logparam) {      
            var prevEntries = 0;
            for (var e = 0 ; logparam == "ShowEverything" && e < elevators.length ; e++) {
                console.log("listPassengersWeightInElevator " + e);
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
        }
        // Az utolsó 5-20 értékből a legkisebbet vagy a legnagyobbat kell kiválasztani, mert egyszerre sokan nyomják meg a gombot.// de azt a hívó függvénynek kell kiválogatni az utolsó értékekböl, annyiból ahány emelet van.   return currLoad-prevLoad;//console.log("avgWaitTime:" + avgWaitTime + "  maxWaitTime:" + maxWaitTime + " moveCount:" + moveCount + " transportedCounter:" + transportedCounter);

        removeDuplicates = function (originalArray, sort) {
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

        rearrangeDestinationQueue = function (elevatorNumber, OriginalDestQ, PressedFloors, currentFloor, visit, logparam) {     
            var array = []; 
            var ret = []; 
            var j = 0;
            var change = 0;
            for (var i=0 ; i<=floors.length ; i++) {
                if ((currentFloor - i) >= 0 )
                    array.push( (currentFloor - i) ); 
                if ((currentFloor + i) <= floors.length)   
                    array.push( (currentFloor + i) );
            }
            for (var i=0 ; i<=array.length-1 ; i++) {
                for (var j=0 ; j<=PressedFloors.length-1 ; j++) {
                    if (array[i] == PressedFloors[j]  ||  array[i] == visit) {
                        change++;
                        break;
                    }
                }            
            }             
            for (var i=0 ; change && i<=array.length-1 ; i++) {
                for (var j=0 ; j<=PressedFloors.length-1 ; j++) {
                    if ((array[i] == PressedFloors[j] || array[i] == visit) && change ) {
                        ret.push( array[i] );
                    }
                }            
            }                              
            if (logparam == "ShowLog") 
                console.log("Elevator " + elevatorNumber + " Queue changed from: " + OriginalDestQ + " To: " + ret);                        
            return ret;
        }             

        visitNearestFirst = function (elevatorNumber,  logparam) {                    
            var PressedFloors = elevators[elevatorNumber].getPressedFloors(); 
            var nearest = nearestFloor(elevators[elevatorNumber] , "ShowLog");         
            elevators[elevatorNumber].destinationQueue = [];  
            if (nearest != -1) 
                elevators[elevatorNumber].destinationQueue.push(nearest);     //elevators[elevatorNumber].goToFloor(nearest,true);
            for (p=0 ; p<PressedFloors.length ; p++) 
                elevators[elevatorNumber].destinationQueue.push(PressedFloors[p]);
            elevators[elevatorNumber].destinationQueue = removeDuplicates(elevators[elevatorNumber].destinationQueue,"NoSort");
            elevators[elevatorNumber].checkDestinationQueue();
            if (logparam=="ShowLog")
                console.log("NEAREST:" + nearest + " visitFloor:" + visitFloor + " dq:" + elevators[elevatorNumber].destinationQueue);            
        }   

        nearestFloor = function (elevator, logparam) {                
            var nearest = -1;
            var distance = 99;
            var PressedFloors = elevator.getPressedFloors(); 
            for (p=0 ; p<PressedFloors.length ; p++) {
                if (Math.abs( elevator.currentFloor() - PressedFloors[p] ) < distance) {
                    distance = Math.abs( elevator.currentFloor() - PressedFloors[p] );                
                    nearest = PressedFloors[p];
                }            
            }
            return nearest;
        } 

        indexOfMax = function(arr) {
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

        addWaitingFloor = function (calledFromFloor, UpOrDownBtn, logparam) {
            if (UpOrDownBtn == "up_button_pressed")
                waitingFloorsUp[calledFromFloor] = timer;
            if (UpOrDownBtn == "down_button_pressed")
                waitingFloorsDn[calledFromFloor] = timer; 
            longestWaitingFloorUp = indexOfMax(waitingFloorsUp);
            longestWaitingFloorDn = indexOfMax(waitingFloorsDn);
            var msg = "";
            if (logparam == "ShowLog" ) {            
                if (waitingFloorsUp[longestWaitingFloorUp])
                    msg += "longestWaitingFloorUp " + longestWaitingFloorUp + ": " + (timer-waitingFloorsUp[longestWaitingFloorUp]).toFixed() + "s";                    
                if (waitingFloorsDn[longestWaitingFloorDn])
                    msg += "longestWaitingFloorDn " + longestWaitingFloorDn + ": " + (timer-waitingFloorsDn[longestWaitingFloorDn]).toFixed() + "s";
                console.log(msg);
            }
        }

        idleBehavior = function (elevator, elevatorNumber, logparam) {  // Nem idle, de sok lift csak álldogál, ami üres azt azonnal küldeni kell egy szintre ahova liftet hivtak
            if (longestWaitingFloorUp > longestWaitingFloorDn )
                elevator.goToFloor(longestWaitingFloorUp);
            else
                elevator.goToFloor(longestWaitingFloorDn);
            if (logparam == "ShowLog" )
                console.log(" Elevator "  + elevatorNumber + " was Idle");            
        }     

        showTimers = function() {    
            var strMsg = "\nLoad\t";
            for (var e=0 ; e<elevators.length ; e++) 
                strMsg += (elevators[e].loadFactor()*100).toFixed() + "%\t\t";                   
            console.log(strMsg);            
            strMsg = "Fl/E\t";
            for (var e=0 ; e<elevators.length ; e++) 
                strMsg += e.toString() + "\t\t";
            strMsg += "UP\t\tDOWN";
            console.log(strMsg);            
            for (var f=floors.length-1 ; f>=0 ; f--) {
                strMsg = f.toString() + "%c\t\t";
                for (var e=0 ; e<elevators.length ; e++) {
                    if (waitingInsideElevators[e][f] == -1)
                        strMsg += "  \t\t";
                    else
                        strMsg += ((timer-waitingInsideElevators[e][f]).toFixed()).toString() + "\t\t";
                }
                if (waitingFloorsUp[f]) {
                    strMsg += (timer-waitingFloorsUp[f]).toFixed() + "\t\t"
                }
                else
                    strMsg += "\t\t";
                if (waitingFloorsDn[f]){
                    strMsg += (timer-waitingFloorsDn[f]).toFixed();
                }
                console.log(strMsg,'background: #fff; color: #04e');
            }
        }

        floorButtonPressedBehavior = function (elevator, elevatorNumber, FloorBtnPressed, behavior, logparam) {            
            waitingInsideElevators[elevatorNumber][FloorBtnPressed] = timer;         
            switch (behavior) {
                case "rearrange": // Oda megy ahova küldik, de optimalizált sorrendben
                    elevator.destinationQueue = rearrangeDestinationQueue(elevatorNumber, elevator.destinationQueue, elevator.getPressedFloors(), elevator.currentFloor(), -1, "NO ShowLog");
                    elevator.checkDestinationQueue();     
                    updateIndicators(true,"TWOALL");     // Jó ez csak beszáll mindenki, az is akinek nemkéne                
                    break;
                case "visitNearestFirst":
                    visitNearestFirst(elevatorNumber, "NoLog");
                    updateIndicators(true,"TWOALL");
                    break;                    
                default:   // "FirstComeFirstServe":  Oda megy ahova küldik
                    elevator.goToFloor(FloorBtnPressed);
            }
            passingersWeightInElevators[counter][elevatorNumber] = elevator.loadFactor();
            if (counter++ > arraySize-50)
                counter=0;            
            if (logparam == "ShowLog") 
                console.log("FloorButtonPressed(" + behavior + "," + FloorBtnPressed + ")  Queue: " + elevator.destinationQueue + " Elevator " + elevatorNumber + " is at floor " + elevator.currentFloor());                      
            listPassengersWeightInElevator(elevatorNumber, "FloorButtonPressed",  "NoLog");
        }

        passingFloorBehavior  = function (elevator, elevatorNumber, passFloorNum, direction, logparam) {   
            visitNearestFirst(elevatorNumber, "NoLog");                         
            var PressedFloors = elevator.getPressedFloors();
            var dq = elevator.destinationQueue;
            for (var i = 0 ; i < dq.length ; i++) {                
                if (passFloorNum == dq[i]) { 
                    /*
                    Ha olyan emelet mellett megy el ahonnan hívtak liftet akkor álljon meg
                    elevator.destinationQueue = [];
                    elevator.destinationQueue.push(passFloorNum);
                    for (var b = 0 ; b < dq.length ; b++ ) {
                        elevator.destinationQueue.push(dq[b]);
                    }
                    elevator.checkDestinationQueue();

                    elevator.stop();     // Lehet nem stop kéne hanem előre tenni a DQ-ban                
                    elevator.goToFloor(passFloorNum,true);
                    dq.splice( dq.indexOf(passFloorNum) , 1);                    
                    for (var b = 0 ; b < dq.length ; b++ ) {
                        elevator.destinationQueue.push(dq[b]);
                    }
                    elevator.checkDestinationQueue();
                    */
                    if (logparam == "ShowLog") 
                        console.log("Elevator " + elevatorNumber + " Passing Floor " + passFloorNum + ". Direction:" + direction + ". PressedFloors: " + PressedFloors + " \t Queue: " + elevator.destinationQueue);    
                }
            }
        }

        stoppedAtFloorBehavior  = function (elevator, elevatorNumber, Floor, logparam) {   
            visitNearestFirst(elevatorNumber, "NoLog");                        
            updateIndicators(true, "TWO");              
            if (maxWaitingInElevator < timer-waitingInsideElevators[elevatorNumber][Floor] && waitingInsideElevators[elevatorNumber][Floor]!=-1)
                maxWaitingInElevator = timer-waitingInsideElevators[elevatorNumber][Floor];
            if (maxWaitingForElevator < timer-waitingFloorsUp[Floor] && waitingFloorsUp[Floor])
                maxWaitingForElevator = timer-waitingFloorsUp[Floor];
            if (maxWaitingForElevator < timer-waitingFloorsDn[Floor] && waitingFloorsDn[Floor]) 
                maxWaitingForElevator = timer-waitingFloorsDn[Floor];             
            if (waitingInsideElevators[elevatorNumber][Floor] != -1) {
                if (logparam=="ShowLog")  // Itt akkor is kiirja ha nem bentröl nyomták meg hanem oda hivták a liftet, ezt külön kell választani
                    console.log("Passengers in elevator " + elevatorNumber + " delivered to floor " + Floor + " in " + (timer-waitingInsideElevators[elevatorNumber][Floor]).toFixed() + "s    loadFactor:" + elevator.loadFactor().toFixed(2) + " maxWaitingInElevator:" + maxWaitingInElevator.toFixed() + " maxWaitingForElevator:" +maxWaitingForElevator.toFixed());
            }
            waitingInsideElevators[elevatorNumber][Floor] = -1;
            waitingFloorsUp[Floor] = 0;  // Később majd csak akkor kell nullázni, ha arra ment a lift, és elis vitte a várakozókat
            waitingFloorsDn[Floor] = 0;
            passingersWeightInElevators[counter][elevatorNumber] = elevator.loadFactor();
            if (counter++ > arraySize-50)
                counter=0;
            listPassengersWeightInElevator(elevatorNumber, "Elevator Stopped", "NoLog");           
        }

        SendLeastLoadedElevatorToFloor  = function (floor, UpOrDownBtn, freeSpace, sendImmediately, logparam) {    
            var LeastLoadedElevator = -1;  // Itt férőhellyel kéne számolni (1-loadfactor)*maxpassengers
            var LeastLoadedElevatorsFreeSpace = -1;
            var Dist = 999;            
            for (var e = 0 ; e < elevators.length ; e++ ) {
                if ( LeastLoadedElevatorsFreeSpace <  ((1 - elevators[e].loadFactor() ) * elevators[e].maxPassengerCount()) ) {
                    LeastLoadedElevatorsFreeSpace = ((1 - elevators[e].loadFactor() ) * elevators[e].maxPassengerCount())
                    LeastLoadedElevator = e;
                    Dist =  Math.abs(elevators[LeastLoadedElevator].currentFloor() - floor);
                }
            }
            if (LeastLoadedElevator != -1 && LeastLoadedElevatorsFreeSpace>=freeSpace) {
                if (sendImmediately) {                    
                    elevators[LeastLoadedElevator].goToFloor(floor, true);        
                }                        
                else {  // DQ rendezés kell, ha van szabad hely, akkor kerüljön előrébb a floor a DQ-ban, emeleteket sorrendben kéne bejárni
                    elevators[LeastLoadedElevator].destinationQueue.push(floor);  // duplicates
                    elevators[LeastLoadedElevator].destinationQueue = removeDuplicates(elevators[LeastLoadedElevator].destinationQueue, "No Sort");
                    elevators[LeastLoadedElevator].checkDestinationQueue();     
                    waitingInsideElevators[LeastLoadedElevator][floor] = timer;  // Az elnevezés nem jó, és a log kijelzés sem így!
                }
            }      
            else  
                LeastLoadedElevator = -1;                        
            if (UpOrDownBtn == "up_button_pressed") {            
                if (logparam=="ShowLog" && LeastLoadedElevator != -1)        
                    console.log("Up Button Pressed on Floor " + floor + " Dist:" + Dist + " "  + " elevators[" + LeastLoadedElevator + "].destinationQueue:" + elevators[LeastLoadedElevator].destinationQueue + "\nFreeSpace:" + LeastLoadedElevatorsFreeSpace.toFixed(2));
            }
            if (UpOrDownBtn == "down_button_pressed") {            
                if (logparam=="ShowLog" && LeastLoadedElevator != -1)        
                    console.log("Down Button Pressed on Floor " + floor + " Dist:" + Dist + " "  + " elevators[" + LeastLoadedElevator + "].destinationQueue:" + elevators[LeastLoadedElevator].destinationQueue + "\nFreeSpace:" + LeastLoadedElevatorsFreeSpace.toFixed(2));
            } 
        }    

        ButtonPressedOnFloor  = function (floor, UpOrDownBtn, freeSpace, sendImmediately, logparam) {       
            SendLeastLoadedElevatorToFloor(floor, UpOrDownBtn, freeSpace, sendImmediately, logparam); 
            addWaitingFloor(floor, UpOrDownBtn, "NoLog");                   
        }  

        _.each(elevators, function(elevator,index) {
            elevator.on("idle", function() {
                idleBehavior(elevator, "ShowLog");
            });
            elevator.on("floor_button_pressed", function(floorNum) {
                floorButtonPressedBehavior(elevator, index, floorNum, "visitNearestFirst", "NoLog");
            });
            elevator.on("passing_floor", function(passFloorNum, direction) {
                passingFloorBehavior(elevator, index, passFloorNum, direction, "nShowLog");   
            });
            elevator.on("stopped_at_floor", function(floorNum) {
                stoppedAtFloorBehavior(elevator, index, floorNum, "NOLog");     
            });            
        });              

        _.each(floors, function(floor) {
            floor.on("down_button_pressed", function() {
                ButtonPressedOnFloor( floor.floorNum(), "down_button_pressed", 2, true, "ShowLog" );
            });             
            floor.on("up_button_pressed", function() {
                ButtonPressedOnFloor( floor.floorNum(), "up_button_pressed", 2, true, "ShowLog" );
            });             
        });     
    },

        update: function(dt, elevators, floors) {
            timer = timer + dt;     
            counter++;            
            lastshown = shown;
            if ( timer > (shown+interval) ) {
                showTimers();    
                shown = timer;
            }
            var UseAllElevators = true;
            for (var i = 0 ; !UseAllElevators && i<elevators.length-1 ; i++) 
                elevators[i].stop();
        }
}

