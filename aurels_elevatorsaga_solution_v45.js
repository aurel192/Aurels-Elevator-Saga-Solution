
{     // https://github.com/aurel192/Aurels-Elevator-Saga-Solution
// best settings: PF6 SLL D4F U5F
// Transported/s 1.50
// Avg waiting time 13.4s
// Max waiting time 65.3s
// elevate-me.hu min 1564 avg 1600 max 1641
    init: function(elevators, floors) {              
        _.each(elevators, function(elevator,index) {
            elevator.on("idle", function() {
                idle(elevator);
            });
            elevator.on("floor_button_pressed", function(floorNum) {
                floorButtonPressed(elevator, floorNum);
            });
            elevator.on("passing_floor", function(passFloorNum, direction) {
                passingFloor(elevator, passFloorNum, 6, direction);           
            });
            elevator.on("stopped_at_floor", function(floorNum) {
                stoppedAtFloor(elevator, floorNum);
            });
        });
        _.each(floors, function(floor) {
            floor.on("down_button_pressed", function() {
                buttonPressedOnFloor( floor.floorNum(), "down_button_pressed", 4, 99999, false);
            });
            floor.on("up_button_pressed", function() {
                buttonPressedOnFloor( floor.floorNum(), "up_button_pressed", 5, 99999, false);
            });
        });        
        shown = 0;                        // USED FOR TIMER
        interval = 2;                     // USED FOR TIMER
        timer = 0;                        // THIS VARIABLE CONTAINS THE TIME IN SECONDS, PASSED SINCE START
        counter = 0;
        for (var f=0 ; f<floors.length ; f++) {    
            floors[f].waitingUp = 0;            // EACH FLOOR HAS 4 ADDITIONAL PROPERTIES
            floors[f].waitingUpCntr = 0;        // THAT TELLS HOW LONG PEOPLE ARE WAITING FOR  
            floors[f].waitingDn = 0;            // AN ELEVATORS ARRIVAL (TO GET INTO THE ELEVATOR)
            floors[f].waitingDnCntr = 0;        // ALSO HAS COUNTERS THAT TELLS HOW MANY TIMES THE (UP/DOWN) BUTTONS HAVE BEEN PRESSED 
        }
        for (var e=0 ; e<elevators.length ; e++) {    // EACH ELEVATOR HAS AN ADDITIONAL PROPERTY FOR SHOWING
            elevators[e].waitingInside = [];          // HOW MUCH TIME PASSED SINCE A FLOOR BUTTON HAS BEEN PRESSED INSIDE AN ELEVATOR 
            for (var f=0 ; f<floors.length ; f++)     // FOR EXAMPLE: timer - elevators[0].waitingInside[3] == 12 
                elevators[e].waitingInside[f] = 0;    // MEANS THAT THE FIRST ELEVATOR IS WAITING TO GET TO THE THIRD FLOOR FOR 12s             
        }

        removeDuplicates = function (originalArray, sort) {   // THIS FUNCTION IS USED TO REMOVE DUPLICATES
            var result = [];                                  // IN DESTINATION QUEUE
            $.each(originalArray, function(i, e) { 
                if ($.inArray(e, result) == -1) result.push(e);
            });
            if (sort == "Sort") {                             // IF THE SECOND PARAMETER IS "Sort" 
                result.sort(function(a, b) {                  // THE FUNCTION WILL RETURN UNIQUE ELEMENTS   
                    return a - b;                             // IN ASCENDING ORDER
                });
            }
            return result;
        }

        addWaitingFloor = function (calledFromFloor, UpOrDownBtn) {  // THIS FUNCTION IS USED TO ALTER ADDITIONAL PROPERTIES OF FLOORS
            if (UpOrDownBtn == "up_button_pressed"){                 // WHEN A BUTTON IS PRESSED ON A FLOOR
                floors[calledFromFloor].waitingUp = timer;           // THE  WAITINGUP PROPERTY GETS THE TIMERS VALUE
                floors[calledFromFloor].waitingUpCntr++;             // FOR EXAMPLE IF THE DOWN BUTTON WAS PRESSED ON FLOOR 5, 10sec AFTER START
            }                                                        // THEN THE floors[5].waitingUp WILL BE EQUAL TO 10
            if (UpOrDownBtn == "down_button_pressed"){               // TIME PASSED SINCE THE BUTTON WAS PRESSED CAN BE CALCUALTED
                floors[calledFromFloor].waitingDn = timer;           // TIMER - FLOORS[5].WAITINGUP
                floors[calledFromFloor].waitingDnCntr++;
            }
        }

        visitFloorWithPriority = function (elevator, floor) {    // EQUIVALENT TO GOTOFLOOR(FLOOR,TRUE), 
            elevator.destinationQueue.splice(0, 0, floor);       // BUT IT REMOVES DUPLICATIONS FROM DESTINATIONQUEUE
            elevator.destinationQueue = removeDuplicates(elevator.destinationQueue, "NoSort"); // WITHOUT SORTING
            elevator.checkDestinationQueue();
        }

        visitFloor = function (elevator, floor) {                // EQUIVALENT TO GOTOFLOOR(FLOOR,TRUE), 
            elevator.destinationQueue.push(floor);               // BUT IT REMOVES DUPLICATIONS FROM DESTINATIONQUEUE
            elevator.destinationQueue = removeDuplicates(elevator.destinationQueue, "NoSort");
            elevator.checkDestinationQueue();
        }

        visitNearestFirst = function (e, visitFloor) {           // WHEN THIS FUNCTION IS CALLED 
            if (visitFloor != -1)                                // THE ELEVATOR WILL GO TO THE NEAREST FLOOR
                e.destinationQueue.push(visitFloor);             // THE PASSENGERS WANTS TO GO  (PRESSED FLOORS)
            var PressedFloors = e.getPressedFloors();            //   FOR EXAMPLE IF THE ELEVATOR IS ON FLOOR 5,
            var nearest = nearestFloor(e);                       //   AND THE PRESSED FLOORS ARE 1,3,6,8
            if (nearest != -1)                                   //   THE ELEVATOR WILL GO TO FLOOR 6 
                visitFloorWithPriority(e ,nearest);
        }

        nearestFloor = function (elevator) {                      // THIS FUNCTIONS ARGUMENT IS AN ELEVATOR OBJECT
            var nearest = -1;                                     // AND CALCULATES WHICH FLOOR IS THE NEAREST
            var distance = 99;                                    // FLOOR PASSENGERS WANTS TO GO TO. (PRESSED FLOORS)
            var PressedFloors = elevator.getPressedFloors();      // AND RETURNS THE NUMBER OF THE NEAREST FLOOR (IN PRESSEDFLOORS)
            for (p=0 ; p<PressedFloors.length ; p++) {
                if (Math.abs( elevator.currentFloor() - PressedFloors[p] ) < distance) {
                    distance = Math.abs( elevator.currentFloor() - PressedFloors[p] );
                    nearest = PressedFloors[p];
                }
            }
            return nearest;
        }

        idle = function (elevator) {       // WHAT TO DO WHEN AN ELEVATOR IS IDLE
            elevator.goToFloor(0);         // GROUND FLOOR IS GREAT BECOUSE ITS ALWAYS CROWDED 
        }

        floorButtonPressed = function (elevator, FloorBtnPressed) {             // WHEN A BUTTON IS PRESSED INSIDE AN ELEVATOR
            elevator.waitingInside[FloorBtnPressed] = timer;                    // THE TIMERS VALUE IS ASSIGNED TO THE ELEVATORS WAITINGINSIDE[FloorBtnPressed] PROPERTY
            elevator.goToFloor(FloorBtnPressed);                                // ADDS FLOOR TO DESTINATIONQUEUE.
        }                                                                       

        passingFloor = function (elevator, passFloorNum, minFreeSpace, direction) {  // SOMETIMES WHEN AN ELEVATOR IS PASSING THROUGH FLOORS 
            var pf = elevator.getPressedFloors();                                    // IT IS AN ADVANTAGE TO STOP, TO PICK UP, OR TO DELIVER PASSENGERS  
            var dq = elevator.destinationQueue;
            if (pf.includes(passFloorNum)) {                                     // IF THE ELEVATOR IS PASSING THROUGH A FLOOR THAT PASSENGERS WANTS TO GO
                visitFloorWithPriority(elevator, passFloorNum);                  // THE ELEVATOR SHOULD STOP THERE 
            }                                                                    // NOTE: .STOP() FUNTION EMPTIES THE DESTINATIONQUEUE, THEREFORE I DONT USE IT 
            if ( floors[passFloorNum].waitingUp &&                                           // WHEN PASSING THROUGH A FLOOR WHERE PASSENGERS ARE WAITING (OUTSIDE) TO GO TO A HIGHER FLOOR
            ( ((1-elevator.loadFactor())*elevator.maxPassengerCount()) >= minFreeSpace ) &&  // AND THERE IS FREE SPACE INSIDE THE ELEVATOR (1-LOADFACTOR)*MAXPASSANGERCOUNT ~ FREE SPACE
            direction=="up" ) {                                                              // AND THE ELEVATOR IS MOVING IN THAT DIRECTION 
                visitFloorWithPriority(elevator, passFloorNum);                              // STOP AT THAT FLOOR, WITHOUT CLEARING DESTINATIONQUEUE
                floors[passFloorNum].waitingUp = 0;                                          // RESET THE WAITINGUP TIMER
            }
            if ( floors[passFloorNum].waitingDn && ( ((1-elevator.loadFactor())*elevator.maxPassengerCount()) >= minFreeSpace ) && direction=="down" ) {
                visitFloorWithPriority(elevator, passFloorNum);
                floors[passFloorNum].waitingDn = 0;
            }
        }

        stoppedAtFloor = function (elevator, Floor) {              // EACH TIME THE ELEVATOR STOPS
            visitNearestFirst(elevator, -1);                       // WE CHECK WHICH IS THE NEAREST FLOOR THE PASSENGERS WANTS TO GO
            elevator.waitingInside[Floor] = -1;                    // AND RESET THE TIMER INSIDE THE ELEVATOR
            floors[Floor].waitingUp = 0;                           // AND ON THE FLOOR (UP/DOWN) 
            floors[Floor].waitingDn = 0;
        }

        visitWaitingFloor = function (e) {
            var max = 0;
            var maxindex = -1;
            for (var f=floors.length-1 ; f>0 ; f--) {    
                if ((timer - floors[f].waitingUp) > max) {  
                    max = timer-floors[f].waitingUp;
                    maxindex = f;
                }
                if ((timer - floors[f].waitingDn) > max) {
                    max = timer-floors[f].waitingDn;                
                    maxindex = f;
                }
            }
            sendLeastLoadedElevatorToFloor(maxindex, "visitWaitingFloor", 3, true);
        }

        sendLeastLoadedElevatorToFloor  = function (floor, UpOrDownBtn, minFreeSpace, sendImmediately) {    // THIS FUNCTION IS USED TO SEND THE LEAST LOADED ELEVATOR TO A FLOOR
            if (UpOrDownBtn=="visitWaitingFloor")console.log("visitWaitingFloor"+floor);
            var LeastLoadedElevator = -1;                                                                   // WHERE PASSENGERS ARE WAITING FOR THE ELEVATORS ARRIVAL (OUTSIDE)
            var LeastLoadedElevatorsFreeSpace = -1;                                                         // THE LEAST LOADED ELEVATOR SHOULD BE SENT TO A WAITING FLOOR
            var Dist = 999;                                                                                 // SO MORE PASSENGERS WILL FIT INSIDE
            for (var e = 0 ; e < elevators.length ; e++ ) {                                                 // NOTE: SENDING THE NEAREST LEAST LOADED IS NOT EFFICIENT ENOUGH FOR SOME REASON. FURTHER TESTS NEED...
                if ( LeastLoadedElevatorsFreeSpace <  ((1 - elevators[e].loadFactor() ) * elevators[e].maxPassengerCount()) ) {
                    LeastLoadedElevatorsFreeSpace = ((1 - elevators[e].loadFactor() ) * elevators[e].maxPassengerCount())        // MINIMUM SELECTION
                    LeastLoadedElevator = e;                                                     
                    Dist = Math.abs(elevators[LeastLoadedElevator].currentFloor() - floor);               // FREE SPACE IS (1-LOADFACTOR)*MAXPASSENGERSCOUNT
                }
            }
            if (LeastLoadedElevator != -1 && LeastLoadedElevatorsFreeSpace>=minFreeSpace) {               // IF THERE IS AN ELEVATOR WITH ENOUGH SPACE THAT SOULD BE SENT TO THE FLOOR   
                if (sendImmediately)                                                                      // WHEN THIS FUNCTION IS CALLED WITH SENDIMMEDIATELY=TRUE PARAMETER 
                    visitFloorWithPriority(elevators[LeastLoadedElevator], floor)                         // THE ELEVATOR WILL GO INSTANTLY TO THAT FLOOR, TO ENSURE THE FREE SPACE
                else                                                                                      // ALTHOUGH TESTS PROVE THAT IT IS NOT EFFICIENT, 
                    visitFloor(elevators[LeastLoadedElevator], floor);                                    // SO I JUST ENQUEUE THE FLOOR
            }
        }

        buttonPressedOnFloor  = function (floor, UpOrDownBtn, minFreeSpace, maxWaitTime, sendImmediately) {  // UP/DONW BUTTON PRESSED ON A FLOOR
            if ( sendImmediately ||                                                                          // IF THIS FUNCTION WAS CALLED  SEND IMMEDIATELY = TRUE 
            ((timer-floors[floor].waitingUp)>maxWaitTime) ||                                                 // OR PASSENGERS ARE WAITING ON FLOOR MORE THAN MAXWAITINGTIME
            ((timer-floors[floor].waitingDn)>maxWaitTime) )                                                
                sendLeastLoadedElevatorToFloor(floor, UpOrDownBtn, minFreeSpace, true);                      // THE LEAST LOADED ELEVATOR IS GOING TO PICK THE PASSENGERS UP IMMEDIATELY (NOT EFFICIENT)
            else                                                                                             //       ELSE (IF IT IS NOT THAT URGENT),
                sendLeastLoadedElevatorToFloor(floor, UpOrDownBtn, minFreeSpace, false);                     // THE LEAST LOADED ELEVATOR IS GOING TO PICK THE PASSENGERS UP. (FREE SPACE IS NOT ENSURED ON ARRIVAL)
            addWaitingFloor(floor, UpOrDownBtn);                                                             // ASSIGN TIMERS VALUE TO FLOOR'S WAITINGUP/WAITINGDN PROPERTY
        }

        colorLog = function(msgArr, colorArr) { 
            for (var i=0 ; i<colorArr.length ; i++) {
                colorArr[i] = "color:rgb(" + colorArr[i] + ")";
            }                      
            switch (colorArr.length) {                
                case 0: console.log(msgArr);  break; 
                case 1: console.log(msgArr,colorArr[0]); break; 
                case 2: console.log(msgArr,colorArr[0],colorArr[1]);; break;
                case 3: console.log(msgArr,colorArr[0],colorArr[1],colorArr[2]); break;
                case 4: console.log(msgArr,colorArr[0],colorArr[1],colorArr[2],colorArr[3]); break;
                default: console.log(msgArr);
            }         
        }        

        showTimers = function() {                          // PRESS F12, AND SEE WAITING TIMES IN CONSOLE LOG            
            var strMsg = "\n%cLoad\t";
            var strColor = [];
            strColor[0] = "0,0,0";
            strColor[1] = "200,50,50";
            strMsg += "%c"
            for (var e=0 ; e<elevators.length ; e++)                
                strMsg += (elevators[e].loadFactor()*100).toFixed() + "%\t\t";
            colorLog(strMsg,strColor);
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
                strMsg += "%c"
                if (floors[f].waitingUp) {
                    strMsg += (timer-floors[f].waitingUp).toFixed() + "\t\t"
                }
                else
                    strMsg += "\t\t\t";
                if (floors[f].waitingDn){
                    strMsg += (timer-floors[f].waitingDn).toFixed();
                }
                strColor = [];
                strColor[0] = "0,120,255";
                strColor[1] = "0,0,0";
                colorLog(strMsg,strColor);
                //strMsg += floors[f].waitingUpCntr + " | " + floors[f].waitingDnCntr + " ";
                //console.log(strMsg,'background: #fff; color: #04e');
            }
        }                
    },

     update: function(dt, elevators, floors) {
            timer = timer + dt;
            counter++;
            if ( timer > (shown+interval) ) {  
                showTimers();                  // DRAWS THE TIMERS EVERY 2 SECOND
                shown = timer;
            }
     }
}
