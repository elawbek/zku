pragma circom 2.1.2;

include "./Multiplier2.circom";

template Multiplier3 () {  
   // Declaration of signals.  
   signal input a;  
   signal input b;
   signal input c;
   signal output out;  

   component mult2 = Multiplier2();
  
   // Constraints.  
   mult2.a <== a;
   mult2.b <== b;
   out <== mult2.out * c;
}