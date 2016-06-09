
{
    init: function(elevators, floors) {
        shown = 0;
        interval = 3;        
        timer = 0;
        counter = 0;     
           
        longestWaitingFloorUp = 0;
        longestWaitingFloorDn = 0;        
        maxWaitingInElevator = 0;
        maxWaitingForElevator = 0;

        waitingFloorsUp = [];         // floors[0].waitingUp  
        waitingFloorsDn = [];      
        waitingFloorsUpCntr = [];     // floors[0].waitingUpCntr   
        waitingFloorsDnCntr = [];      
        for (var f=0 ; f<floors.length ; f++) {
            waitingFloorsUpCntr[f] = 0;
            waitingFloorsDnCntr[f] = 0;
            floors[f].waitingUp = 0;
            floors[f].waitingUpCntr = 0;
            floors[f].waitingDn = 0;
            floors[f].waitingDnCntr = 0;
        }              
        for (var e=0 ; e<elevators.length ; e++) {
            elevators[e].waitingInside = [];
            for (var f=0 ; f<floors.length ; f++) {
                elevators[e].waitingInside[f] = 0;
            }
            
        }        

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
            }
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
            return result; //  queue = _.uniq(queue);
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
            if (UpOrDownBtn == "up_button_pressed"){
                waitingFloorsUp[calledFromFloor] = timer;
                waitingFloorsUpCntr[calledFromFloor]++;
            }
            if (UpOrDownBtn == "down_button_pressed"){
                waitingFloorsDn[calledFromFloor] = timer; 
                waitingFloorsDnCntr[calledFromFloor]++;
            }
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
                    if (elevators[e].waitingInside[f] == -1)
                        strMsg += "  \t\t";
                    else
                    strMsg += ((timer-elevators[e].waitingInside[f]).toFixed()).toString() + "\t\t";
                }
                if (waitingFloorsUp[f]) {
                    strMsg += (timer-waitingFloorsUp[f]).toFixed() + "s\t"; 
                }
                else
                    strMsg += "\t";
                strMsg += waitingFloorsUpCntr[f].toFixed() + " | " + waitingFloorsDnCntr[f].toFixed() + " ";
                if (waitingFloorsDn[f]){
                    strMsg += (timer-waitingFloorsDn[f]).toFixed() + "s\t";  
                }                
                console.log(strMsg,'background: #fff; color: #04e');
            }
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
            var w = new Array(dq.length);
            for (var i = 0 ; i < dq.length ; i++) {
                w[i] = elevators[elevatorNumber].waitingInside[ dq[i] ];
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
            var dq = elevators[elevatorNumber].destinationQueue;
            dq.push(visit);
            if (logparam=="ShowLog")console.log("rearrangeByClosestFloors E:" + elevatorNumber + " V:" + visit + " dq:" + elevators[elevatorNumber].destinationQueue);
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
            if (logparam=="ShowLog")console.log("                         E:" + elevatorNumber + " V:" + visit + " dq:" + elevators[elevatorNumber].destinationQueue);
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
            if (logparam == "ShowLog")console.log("NEAREST:" + nearest + " visitFloor:" + visitFloor + " dq:" + elevators[elevatorNumber].destinationQueue);            
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

        idle = function (elevator, logparam) {  
            elevator.goToFloor(0); //elevator.goToFloor(Math.floor(Math.random() * (floors.length+1)));
            if (logparam == "ShowLog" )
                console.log(" Elevator "  + elevator.index + " was Idle");            
        }  

        floorButtonPressed = function (elevator, FloorBtnPressed, behavior, logparam) {             
            elevators[elevator.index].waitingInside[FloorBtnPressed] = timer;         
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
                    //updateIndicators(true,"TWOALL");
                    break;
                case "visitNearestFirst":
                    visitNearestFirst(elevator.index, FloorBtnPressed, "NoLog");
                    //updateIndicators(true,"TWOALL");
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
            if (logparam == "ShowLog") 
                console.log("FloorButtonPressed(" + behavior + "," + FloorBtnPressed + ")  Queue: " + elevator.destinationQueue + " Elevator " + elevator.index + " is at floor " + elevator.currentFloor());                      
        }

         // Elevator 0 Passing Floor 10. Direction:down Freespace: 8.00 Queue: 10,0,4
        passingFloor = function (elevator, passFloorNum, minFreeSpace, direction, logparam) {                    
            if ( waitingFloorsUp[passFloorNum] && ( ((1-elevator.loadFactor())*elevator.maxPassengerCount()) >= minFreeSpace ) && direction=="up" ) {
                    elevator.destinationQueue.splice(0, 0, passFloorNum);
                    elevator.destinationQueue = removeDuplicates(elevator.destinationQueue, "NoSort");
                    elevator.checkDestinationQueue();
                    waitingFloorsUp[passFloorNum] = 0;     
                    if (logparam == "ShowLog") 
                        console.log("Elevator " + elevator.index + " Passing Floor " + passFloorNum + ". Direction:" + direction + " Freespace: " + ((1-elevator.loadFactor())*elevator.maxPassengerCount()).toFixed(2) +  " Queue: " + elevator.destinationQueue);    
            } 
            if ( waitingFloorsDn[passFloorNum] && ( ((1-elevator.loadFactor())*elevator.maxPassengerCount()) >= minFreeSpace ) && direction=="down" ) {
                    elevator.destinationQueue.splice(0, 0, passFloorNum);
                    elevator.destinationQueue = removeDuplicates(elevator.destinationQueue, "NoSort");
                    elevator.checkDestinationQueue();
                    waitingFloorsDn[passFloorNum] = 0;     
                    if (logparam == "ShowLog") 
                        console.log("Elevator " + elevator.index + " Passing Floor " + passFloorNum + ". Direction:" + direction + " Freespace: " + ((1-elevator.loadFactor())*elevator.maxPassengerCount()).toFixed(2) +  " Queue: " + elevator.destinationQueue);    
            }                   
        }
                       
        stoppedAtFloor = function (elevator, Floor, logparam) {
            visitNearestFirst(elevator.index, -1, "NoLog");                           
            if (maxWaitingInElevator < timer-elevators[elevator.index].waitingInside[Floor] && elevators[elevator.index].waitingInside[Floor]!=-1)
                maxWaitingInElevator = timer-elevators[elevator.index].waitingInside[Floor];
            if (maxWaitingForElevator < timer-waitingFloorsUp[Floor] && waitingFloorsUp[Floor])
                maxWaitingForElevator = timer-waitingFloorsUp[Floor];
            if (maxWaitingForElevator < timer-waitingFloorsDn[Floor] && waitingFloorsDn[Floor]) 
                maxWaitingForElevator = timer-waitingFloorsDn[Floor];             
            if (elevators[elevator.index].waitingInside[Floor] != -1) {
                if (logparam=="ShowLog")  // Itt akkor is kiirja ha nem bentröl nyomták meg hanem oda hivták a liftet, ezt külön kell választani
                    console.log("Passengers in elevator " + elevator.index + " delivered to floor " + Floor + " in " + (timer-elevators[elevator.index].waitingInside[Floor]).toFixed() + "s    loadFactor:" + elevator.loadFactor().toFixed(2) + " maxWaitingInElevator:" + maxWaitingInElevator.toFixed() + " maxWaitingForElevator:" +maxWaitingForElevator.toFixed());
            }
            elevators[elevator.index].waitingInside[Floor] = -1;
            waitingFloorsUp[Floor] = 0;  // Később majd csak akkor kell nullázni, ha arra ment a lift, és elis vitte a várakozókat
            waitingFloorsDn[Floor] = 0;          
        }

        SendLeastLoadedElevatorToFloor  = function (floor, UpOrDownBtn, minFreeSpace, sendImmediately, logparam) {    
            var LeastLoadedElevator = -1;
            var LeastLoadedElevatorsFreeSpace = -1;
            var Dist = 999;            
            for (var e = 0 ; e < elevators.length ; e++ ) {
                if ( LeastLoadedElevatorsFreeSpace <  ((1 - elevators[e].loadFactor() ) * elevators[e].maxPassengerCount()) ) {
                    LeastLoadedElevatorsFreeSpace = ((1 - elevators[e].loadFactor() ) * elevators[e].maxPassengerCount())
                    LeastLoadedElevator = e;
                    Dist =  Math.abs(elevators[LeastLoadedElevator].currentFloor() - floor);
                }
            }
            if (LeastLoadedElevator != -1 && LeastLoadedElevatorsFreeSpace>=minFreeSpace) {
                if (sendImmediately) {                    
                    elevators[LeastLoadedElevator].goToFloor(floor, true);        
                }                        
                else {  // DQ rendezés kell, ha van szabad hely, akkor kerüljön előrébb a floor a DQ-ban, emeleteket sorrendben kéne bejárni
                    elevators[LeastLoadedElevator].destinationQueue.push(floor);
                    elevators[LeastLoadedElevator].destinationQueue = removeDuplicates(elevators[LeastLoadedElevator].destinationQueue, "No Sort");
                    elevators[LeastLoadedElevator].checkDestinationQueue();     
                    elevators[LeastLoadedElevator].waitingInside[floor] = timer;  // Az elnevezés nem jó, és a log kijelzés sem így!
                }
            }      
            else  
                LeastLoadedElevator = -1;                        
            if (UpOrDownBtn == "up_button_pressed") {            
                if (logparam=="ShowLog" && LeastLoadedElevator != -1)        
                    console.log("Up Button Pressed on Floor " + floor + " Dist:" + Dist + " "  + " elevators[" + LeastLoadedElevator + "].destinationQueue:" + elevators[LeastLoadedElevator].destinationQueue + "\nFreeSpace:" + LeastLoadedElevatorsFreeSpace.toFixed(2) + " urgent:" + sendImmediately);
            }
            if (UpOrDownBtn == "down_button_pressed") {            
                if (logparam=="ShowLog" && LeastLoadedElevator != -1)        
                    console.log("Down Button Pressed on Floor " + floor + " Dist:" + Dist + " "  + " elevators[" + LeastLoadedElevator + "].destinationQueue:" + elevators[LeastLoadedElevator].destinationQueue + "\nFreeSpace:" + LeastLoadedElevatorsFreeSpace.toFixed(2) + " urgent:" + sendImmediately);
            } 
        }    

        ButtonPressedOnFloor  = function (floor, UpOrDownBtn, minFreeSpace, sendImmediately, logparam) {   
            maxWaitTime = 999;
            if ( ((timer-waitingFloorsUp[floor])>maxWaitTime) || ((timer-waitingFloorsDn[floor])>maxWaitTime) )     
                SendLeastLoadedElevatorToFloor(floor, UpOrDownBtn, minFreeSpace, true, "ShowLog"); 
            else
                SendLeastLoadedElevatorToFloor(floor, UpOrDownBtn, minFreeSpace, false, logparam); 
            addWaitingFloor(floor, UpOrDownBtn, "NoLog");                   
        }  

        _.each(elevators, function(elevator,index) {
            elevator.index = index;
            elevator.on("idle", function() {
                idle(elevator, "NoLog");
            });
            elevator.on("floor_button_pressed", function(floorNum) {
                floorButtonPressed(elevator, floorNum, "rearrangeDestinationQueue", "NoLog");
            });
            elevator.on("passing_floor", function(passFloorNum, direction) {
                passingFloor(elevator, passFloorNum, 5, direction, "NoLog");    
            });
            elevator.on("stopped_at_floor", function(floorNum) {
                stoppedAtFloor(elevator, floorNum, "NoLog");     
            });           
        });              

        _.each(floors, function(floor) {
            floor.on("down_button_pressed", function() {
                ButtonPressedOnFloor( floor.floorNum(), "down_button_pressed", 3, false, "NoLog" );
            });             
            floor.on("up_button_pressed", function() {
                ButtonPressedOnFloor( floor.floorNum(), "up_button_pressed", 3, false, "NoLog" );
            });             
        });     
    },
    
     update: function(dt, elevators, floors) {
            timer = timer + dt;     
            counter++;            
            if ( timer > (shown+interval) ) {
                showTimers();    
                shown = timer;
            }
     }
}

