
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

        rearrangeByWaitingTime = function (elevatorNumber, visit, logparam) {                      
            var dq = elevators[elevatorNumber].destinationQueue;
            dq.push(visit);
            dq = removeDuplicates(dq, "Sort");            
            console.log("rearrangeByWaitingTime," + elevatorNumber + " " + visit + " dq:" + elevators[elevatorNumber].destinationQueue);
            var w = new Array(dq.length);
            for (var i = 0 ; i < dq.length ; i++) {
                w[i] = waitingInsideElevators[elevatorNumber][ dq[i] ];
            }
            for (var i = 0 ; logparam=="ShowLog" && i < dq.length ; i++) {
                console.log("BEF i=" + i + "  dq[i]=" + dq[i] + " w[i]=" + w[i].toFixed());
            }          
            var swapped;
            do {
                swapped = false;
                for (var i=0; i < w.length-1; i++) {
                    if (w[i] > w[i+1]) {
                        var wtemp = w[i];
                        var dqtemp = dq[i];
                        w[i] = w[i+1];
                        dq[i] = dq[i+1];
                        w[i+1] = wtemp;
                        dq[i+1] = dqtemp;
                        swapped = true;
                    }
                }
            } while (swapped);
            for (var i = 0 ; logparam=="ShowLog" && i < dq.length ; i++) {
                console.log("AFT i=" + i + "  dq[i]=" + dq[i] + " w[i]=" + w[i].toFixed());
            }
            elevators[elevatorNumber].destinationQueue = dq;
            elevators[elevatorNumber].checkDestinationQueue();
        }      

        rearrangeByClosestFloors = function (elevatorNumber, visit, logparam) {            
            if (elevatorNumber!=3) return;            
            var dq = elevators[elevatorNumber].destinationQueue;
            dq.push(visit);
            console.log("rearrangeByClosestFloors E:" + elevatorNumber + " V:" + visit + " dq:" + elevators[elevatorNumber].destinationQueue);
            dq = removeDuplicates(dq, "Sort");                        
            var nearer = -1;
            var GroundFloorPressed = 0;
            if ((elevators[elevatorNumber].currentFloor() / floors.length) > 0.5)
                nearer = floors.length-1;
            else
                nearer = 0;
            elevators[elevatorNumber].destinationQueue = [];
            if (nearer == 0) {
                for (var f = elevators[elevatorNumber].currentFloor() ; f>=0 ; f-- ) 
                    if ( dq.includes(f) )
                        elevators[elevatorNumber].destinationQueue.push(f);
                for (var f = elevators[elevatorNumber].currentFloor() ; f <= floors.length-1 ; f++ ) 
                    if ( dq.includes(f) )
                        elevators[elevatorNumber].destinationQueue.push(f);                    
                    if ( elevators[elevatorNumber].destinationQueue.indexOf(0) != -1) { // Földszintet kiszedem ha az alsó emeleteken van, majd a végére berakom
                        elevators[elevatorNumber].destinationQueue.splice( elevators[elevatorNumber].destinationQueue.indexOf(0) , 1);                    
                        GroundFloorPressed++;
                    }
            }
            if (GroundFloorPressed)
                elevators[elevatorNumber].destinationQueue.push(0);   
            if (nearer == floors.length-1) {
                for (var f = elevators[elevatorNumber].currentFloor() ; f <= floors.length-1 ; f++ ) 
                    if ( dq.includes(f) )
                        elevators[elevatorNumber].destinationQueue.push(f);
                for (var f = elevators[elevatorNumber].currentFloor() ; f>=0 ; f-- ) 
                    if ( dq.includes(f) )
                        elevators[elevatorNumber].destinationQueue.push(f);                    
            }            
            elevators[elevatorNumber].destinationQueue = removeDuplicates(elevators[elevatorNumber].destinationQueue,"NoSort");
            elevators[elevatorNumber].checkDestinationQueue();
            console.log("                         E:" + elevatorNumber + " V:" + visit + " dq:" + elevators[elevatorNumber].destinationQueue);
        }        

        visitNearestFirst = function (elevatorNumber, visitFloor, logparam) {        
            var PressedFloors = elevators[elevatorNumber].getPressedFloors(); 
            var nearest = nearestFloor(elevators[elevatorNumber] , "ShowLog");         
            elevators[elevatorNumber].destinationQueue = [];  
            if (nearest != -1) 
                elevators[elevatorNumber].destinationQueue.push(nearest);     //elevators[elevatorNumber].goToFloor(nearest,true);
            for (p=0 ; p<PressedFloors.length ; p++) 
                elevators[elevatorNumber].destinationQueue.push(PressedFloors[p]);
            elevators[elevatorNumber].destinationQueue = removeDuplicates(elevators[elevatorNumber].destinationQueue,"NoSort");
            elevators[elevatorNumber].checkDestinationQueue();
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
            if (logparam == "ShowLog" ) { // move to listWaitingTimers.            
                if (waitingFloorsUp[longestWaitingFloorUp])
                    msg += "longestWaitingFloorUp " + longestWaitingFloorUp + ": " + (timer-waitingFloorsUp[longestWaitingFloorUp]).toFixed() + "s";                    
                if (waitingFloorsDn[longestWaitingFloorDn])
                    msg += "longestWaitingFloorDn " + longestWaitingFloorDn + ": " + (timer-waitingFloorsDn[longestWaitingFloorDn]).toFixed() + "s";
                console.log(msg);
            }
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

        idle = function (elevator, logparam) {  
            elevator.goToFloor(0); //elevator.goToFloor(Math.floor(Math.random() * (floors.length+1)));
            if (logparam == "ShowLog" )
                console.log(" Elevator "  + elevator.index + " was Idle");            
        }  

        floorButtonPressed = function (elevator, FloorBtnPressed, behavior, logparam) {             
            waitingInsideElevators[elevator.index][FloorBtnPressed] = timer;         
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
                case "firstComeFirstServe":    // Oda megy ahova küldik
                    elevator.goToFloor(FloorBtnPressed);            
                    updateIndicators(true); //false működik a fel/le jelző, de egy idő utan elakad a lift
                    break;
                case "firstComeFirstServeRemoveDuplicates": // Oda megy ahova küldik, Destinationqueue duplikációk nélkül                    
                    elevator.goToFloor(FloorBtnPressed);
                    elevator.destinationQueue = removeDuplicates( elevator.destinationQueue ,"DoNOTSort")
                    elevator.checkDestinationQueue(); 
                    updateIndicators(true);                    
                    break;
                case "rearrange": // Oda megy ahova küldik, de optimalizált sorrendben
                    elevator.destinationQueue = rearrangeDestinationQueue(elevator.index, elevator.destinationQueue, elevator.getPressedFloors(), elevator.currentFloor(), -1, "NO ShowLog");
                    elevator.checkDestinationQueue();     
                    updateIndicators(true,"TWOALL");     // Jó ez csak beszáll mindenki, az is akinek nemkéne                
                    break;
                case "rearrangeByWaitingTime":  // Az a cél hogy minden liftben lévő utastól megszabaduljunk minél hamarabb
                    rearrangeByWaitingTime(elevator.index, FloorBtnPressed, "ShowLog");
                    updateIndicators(true,"TWOALL");
                    break;
                case "rearrangeByClosestFloors":
                    rearrangeByClosestFloors(elevator.index, FloorBtnPressed, "ShowLog");
                    updateIndicators(true,"TWOALL");
                    break;
                case "visitNearestFirst":
                    visitNearestFirst(elevator.index, FloorBtnPressed, "ShowLog");
                    updateIndicators(true,"TWOALL");
                    break;                    
                case "UpDown":  // Az alsó és felső emelet között mozog minden lift, és megáll az olyan emeleteknél ahol hívták (és közel van ~1táv), meg ahova küldték
                    for (var i = 0 ; i<floors.length ; i++)
                        elevator.goToFloor(i);
                    for (var i = floors.length-1 ; i>=0; i--)
                        elevator.goToFloor(i);
                    break;
                default:   // "FirstComeFirstServe":  Oda megy ahova küldik
                    elevator.goToFloor(FloorBtnPressed);
            }
            passingersWeightInElevators[counter][elevator.index] = elevator.loadFactor();
            if (counter++ > arraySize-50)
                counter=0;            
            if (logparam == "ShowLog") 
                console.log("FloorButtonPressed(" + behavior + "," + FloorBtnPressed + ")  Queue: " + elevator.destinationQueue + " Elevator " + elevator.index + " is at floor " + elevator.currentFloor());                      
            listPassengersWeightInElevator(elevator.index, "FloorButtonPressed",  "NoLog");
        }
        
        passingFloor = function (elevator, elevatorNumber, passFloorNum, direction, logparam) {                
            //listWaitingTimers();
            var PressedFloors = elevator.getPressedFloors();
            var dq = elevator.destinationQueue;
            for (var i = 0 ; i < dq.length ; i++) {                
                if (passFloorNum == dq[i]) { 
                    /*
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
                       
        stoppedAtFloor  = function (elevator, elevatorNumber, Floor, logparam) {   
            visitNearestFirst(elevatorNumber, 33, "ShowLog");               
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
            elevator.index = index;
            elevator.on("idle", function() {
                idle(elevator, "ShowLog");
            });
            elevator.on("floor_button_pressed", function(floorNum) {
                floorButtonPressed(elevator, floorNum, "rearrangeDestinationQueue", "ShowLog");
            });
            elevator.on("passing_floor", function(passFloorNum, direction) {
                passingFloor(elevator, index, passFloorNum, direction, "nShowLog");   
            });
            elevator.on("stopped_at_floor", function(floorNum) {
                stoppedAtFloor(elevator, index, floorNum, "NOLog");     
            });           
        });              

        _.each(floors, function(floor) {
            floor.on("down_button_pressed", function() {
                ButtonPressedOnFloor( floor.floorNum(), "down_button_pressed", 3, false, "NShowLog" );
            });             
            floor.on("up_button_pressed", function() {
                ButtonPressedOnFloor( floor.floorNum(), "up_button_pressed", 3, false, "NShowLog" );
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
